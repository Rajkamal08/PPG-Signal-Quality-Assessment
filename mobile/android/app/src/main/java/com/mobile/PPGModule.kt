package com.mobile

import android.annotation.SuppressLint
import android.util.Log
import androidx.appcompat.app.AppCompatActivity
import androidx.camera.core.CameraSelector
import androidx.camera.core.ImageAnalysis
import androidx.camera.core.ImageProxy
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.core.content.ContextCompat
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import java.util.concurrent.ExecutorService
import java.util.concurrent.Executors

class PPGModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    private var cameraExecutor: ExecutorService? = null
    private var isRecording = false
    private var currentCameraProvider: ProcessCameraProvider? = null
    private var currentPromise: Promise? = null

    override fun getName(): String {
        return "PPGModule"
    }

    @ReactMethod
    fun cancelRecording(promise: Promise) {
        if (isRecording) {
            isRecording = false
            val activity = getCurrentActivity() as? AppCompatActivity
            activity?.runOnUiThread {
                currentCameraProvider?.unbindAll()
                cameraExecutor?.shutdown()
                cameraExecutor = null
                
                currentPromise?.reject("E_CANCELLED", "Recording was cancelled by user.")
                currentPromise = null
                promise.resolve("Cancelled")
            }
        } else {
            promise.resolve("Not recording")
        }
    }

    @ReactMethod
    fun startPPGRecording(promise: Promise) {
        if (isRecording) {
            promise.reject("E_ALREADY_RECORDING", "A recording is already in progress.")
            return
        }
        currentPromise = promise

        val activity = getCurrentActivity() as? AppCompatActivity
        if (activity == null) {
            promise.reject("E_NO_ACTIVITY", "Current activity is null.")
            return
        }

        isRecording = true
        cameraExecutor = Executors.newSingleThreadExecutor()
        val cameraProviderFuture = ProcessCameraProvider.getInstance(reactApplicationContext)

        cameraProviderFuture.addListener({
            try {
                val cameraProvider: ProcessCameraProvider = cameraProviderFuture.get()
                currentCameraProvider = cameraProvider
                bindCameraUseCases(activity, cameraProvider, promise)
            } catch (e: Exception) {
                isRecording = false
                promise.reject("E_CAMERA_PROVIDER", "Failed to get camera provider", e)
                currentPromise = null
            }
        }, ContextCompat.getMainExecutor(reactApplicationContext))
    }

    @SuppressLint("UnsafeOptInUsageError")
    private fun bindCameraUseCases(activity: AppCompatActivity, cameraProvider: ProcessCameraProvider, promise: Promise) {
        val cameraSelector = CameraSelector.Builder()
            .requireLensFacing(CameraSelector.LENS_FACING_BACK)
            .build()

        val imageAnalysis = ImageAnalysis.Builder()
            .setOutputImageFormat(ImageAnalysis.OUTPUT_IMAGE_FORMAT_RGBA_8888)
            .setBackpressureStrategy(ImageAnalysis.STRATEGY_KEEP_ONLY_LATEST)
            .build()

        val samples = mutableListOf<Int>()
        var startTime = 0L
        var isDetectingFinger = true
        
        val recordingDurationMs = 10000L // 10 seconds
        val detectionCheckTimeMs = 1000L // Check at 1 second mark

        imageAnalysis.setAnalyzer(cameraExecutor!!) { image: ImageProxy ->
            try {
                if (!isRecording) return@setAnalyzer

                // 1. Process Image - Extract Red Channel --------------------
                val plane = image.planes[0]
                val buffer = plane.buffer
                val width = image.width
                val height = image.height
                val rowStride = plane.rowStride
                val pixelStride = plane.pixelStride

                val cropSize = 100
                val startX = maxOf(0, (width - cropSize) / 2)
                val startY = maxOf(0, (height - cropSize) / 2)
                val endX = minOf(width, startX + cropSize)
                val endY = minOf(height, startY + cropSize)

                var redSum = 0L
                var pixelCount = 0

                for (y in startY until endY) {
                    buffer.position(y * rowStride + startX * pixelStride)
                    for (x in startX until endX) {
                        val red = buffer.get().toInt() and 0xFF
                        redSum += red
                        pixelCount++
                        if (x < endX - 1) {
                            buffer.position(buffer.position() + pixelStride - 1)
                        }
                    }
                }
                val averageRed = if (pixelCount > 0) (redSum / pixelCount).toInt() else 0
                
                if (startTime == 0L) {
                    startTime = System.currentTimeMillis()
                }

                val currentTime = System.currentTimeMillis()
                val elapsed = currentTime - startTime
                
                samples.add(averageRed)

                // 2. Finger Detection Checkpoint (at exactly 1 second) ------
                if (isDetectingFinger && elapsed >= detectionCheckTimeMs) {
                    isDetectingFinger = false // Only check once
                    
                    val mean = samples.average()
                    val variance = samples.map { (it - mean) * (it - mean) }.average()
                    
                    // Human finger over a flash is VERY red (> 180). Bedsheets/ambient usually < 150.
                    // Must not be a flatline (variance > 0.5). We remove the upper variance bound to allow strong pulses.
                    if (mean < 180.0 || variance < 0.5) {
                        if (isRecording) {
                            isRecording = false
                            activity.runOnUiThread {
                                cameraProvider.unbindAll()
                                cameraExecutor?.shutdown()
                                cameraExecutor = null
                                promise.reject("E_NO_FINGER", "Finger not detected. Please cover the camera and flash completely.")
                                currentPromise = null
                            }
                        }
                        return@setAnalyzer
                    }
                }

                // 3. End of Recording Phase ---------------------------------
                if (elapsed >= recordingDurationMs) {
                    if (isRecording) {
                        isRecording = false
                        val actualDurationSeconds = elapsed / 1000.0
                        val fs = samples.size / actualDurationSeconds

                        // Prepare result
                        val result = Arguments.createMap()
                        val samplesArray = Arguments.createArray()
                        for (sample in samples) {
                            samplesArray.pushInt(sample)
                        }
                        result.putArray("samples", samplesArray)
                        result.putDouble("fs", fs)

                        // Run cleanup on main thread
                        activity.runOnUiThread {
                            cameraProvider.unbindAll()
                            cameraExecutor?.shutdown()
                            cameraExecutor = null
                            promise.resolve(result)
                            currentPromise = null
                        }
                    }
                    return@setAnalyzer
                }


            } catch (e: Exception) {
                Log.e("PPGModule", "Error analyzing frame", e)
            } finally {
                // CRITICAL: Always close the image proxy to receive the next frame!
                image.close()
            }
        }

        // Retry logic for binding in case hardware is locked by VisionCamera
        var bindAttempts = 0
        val maxAttempts = 3
        var success = false

        activity.runOnUiThread {
            while (bindAttempts < maxAttempts && !success) {
                try {
                    bindAttempts++
                    cameraProvider.unbindAll()
                    val camera = cameraProvider.bindToLifecycle(
                        activity, cameraSelector, imageAnalysis
                    )
                    // Enable torch (flashlight)
                    camera.cameraControl.enableTorch(true)
                    success = true
                } catch (e: Exception) {
                    Log.w("PPGModule", "Camera bind attempt $bindAttempts failed: ${e.message}")
                    if (bindAttempts >= maxAttempts) {
                        isRecording = false
                        cameraExecutor?.shutdown()
                        promise.reject("E_CAMERA_BIND_FAILED", "Could not bind camera after $maxAttempts attempts.", e)
                        currentPromise = null
                    } else {
                        // Wait a short bit before retrying
                        Thread.sleep(200)
                    }
                }
            }
        }
    }
}
