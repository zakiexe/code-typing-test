document.addEventListener('DOMContentLoaded', function() {
    // Get results from localStorage
    const wpm = localStorage.getItem('wpm') || '0';
    const accuracy = localStorage.getItem('accuracy') || '0';
    const duration = localStorage.getItem('duration') || '60';
    const theme = localStorage.getItem('theme') || 'eclipse';

    
    // Set up chart
    const ctx = document.getElementById('performanceChart').getContext('2d');
    
    // Create chart
    const performanceChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['WPM', 'Accuracy (%)'],
            datasets: [{
                
                data: [wpm, accuracy],
                backgroundColor: [
                    'rgba(54, 162, 235, 0.6)',
                    'rgba(75, 192, 192, 0.6)'
                ],
                borderColor: [
                    'rgba(54, 162, 235, 1)',
                    'rgba(75, 192, 192, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: theme === 'dracula' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                    },
                    ticks: {
                        color: theme === 'dracula' ? '#fff' : '#000'
                    }
                },
                x: {
                    grid: {
                        color: theme === 'dracula' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                    },
                    ticks: {
                        color: theme === 'dracula' ? '#fff' : '#000'
                    }
                }
            },
            plugins: {
                legend: {
                    display: false,
                    labels: {
                        color: theme === 'dracula' ? '#fff' : '#000'
                    }
                }
            }
        }
    });
    

});
