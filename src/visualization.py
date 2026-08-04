import matplotlib.pyplot as plt

def plot_signal(signal, title="PPG Signal", fs=30, color='b'):
    """
    Plots a 1D signal with time on the x-axis.
    """
    time = [i/fs for i in range(len(signal))]
    plt.figure(figsize=(10, 4))
    plt.plot(time, signal, color=color)
    plt.title(title)
    plt.xlabel('Time (s)')
    plt.ylabel('Amplitude')
    plt.grid(True)
    plt.tight_layout()
    plt.show()

def plot_signals_grid(signals, titles, fs=30, rows=5, cols=4):
    """
    Plots a list of signals in a grid.
    """
    fig, axes = plt.subplots(rows, cols, figsize=(15, 3*rows))
    axes = axes.flatten()
    
    for i in range(min(len(signals), rows*cols)):
        time = [t/fs for t in range(len(signals[i]))]
        axes[i].plot(time, signals[i], color='green')
        if titles and i < len(titles):
            axes[i].set_title(titles[i], fontsize=9)
        axes[i].axis('off')
        
    plt.tight_layout()
    plt.show()
