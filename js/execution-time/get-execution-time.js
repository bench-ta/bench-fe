document.addEventListener('DOMContentLoaded', async () => {
    const benchmarkResultsContainer = document.getElementById('benchmarkResults');
    const token = localStorage.getItem('token');

    if (!token) {
        alert('You are not logged in!');
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/api/execution-time/getall', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch benchmarks');
        }

        const data = await response.json();
        if (data.success) {
            const benchmarksByType = {};
            data.data.forEach((benchmark) => {
                if (!benchmarksByType[benchmark.javascriptType]) {
                    benchmarksByType[benchmark.javascriptType] = [];
                }
                benchmarksByType[benchmark.javascriptType].push(benchmark);
            });

            Object.keys(benchmarksByType).forEach(javascriptType => {
                const benchmarks = benchmarksByType[javascriptType];

                const benchmarkElement = document.createElement('div');
                benchmarkElement.classList.add('card', 'mb-3');
                benchmarkElement.innerHTML = `
                    <div class="card-header">
                        <h5>${javascriptType}</h5>
                    </div>
                    <div class="card-body" id="${javascriptType.replace(/\s+/g, '')}">
                        <canvas id="${javascriptType.replace(/\s+/g, '')}Chart" class="chart-canvas"></canvas>
                    </div>
                `;
                benchmarkResultsContainer.appendChild(benchmarkElement);

                const chartLabels = [];
                const chartDataExecutionTime = [];
                const chartDataMemoryUsage = [];
                
                benchmarks.forEach((benchmark, index) => {
                    const resultsElement = document.createElement('div');
                    resultsElement.classList.add('mb-3');
                    resultsElement.innerHTML = `
                        <p><strong>Test Type:</strong> ${benchmark.testType}</p>
                        <p><strong>Overall Average:</strong> ${benchmark.overallAverage}</p>
                        <p><strong>Total Execution Time:</strong> ${benchmark.totalExecutionTime}</p>
                        <p><strong>Test Results:</strong></p>
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Test Code Number</th>
                                    <th>Test Code</th>
                                    <th>Iterations Results</th>
                                    <th>Complexity</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${benchmark.results.map(result => `
                                    <tr>
                                        <td>${result.testCodeNumber}</td>
                                        <td><textarea readonly>${result.testCode}</textarea></td>
                                        <td>
                                            <ul>
                                                ${result.iterationsResults.map(iteration => `
                                                    <li>Iteration ${iteration.iteration}: ${iteration.executionTime}</li>
                                                `).join('')}
                                            </ul>
                                        </td>
                                        <td>
                                            <ul>
                                                <li>Cyclomatic: ${result.complexity.cyclomatic}</li>
                                                <li>SLOC: ${result.complexity.sloc.logical} (Physical: ${result.complexity.sloc.physical})</li>
                                                <li>Halstead: ${result.complexity.halstead.length} (Vocabulary: ${result.complexity.halstead.vocabulary})</li>
                                            </ul>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    `;
                    document.getElementById(javascriptType.replace(/\s+/g, '')).appendChild(resultsElement);

                    // Prepare data for chart
                    chartLabels.push(`Test ${index + 1}`);
                    chartDataExecutionTime.push(parseFloat(benchmark.totalExecutionTime));
                    chartDataMemoryUsage.push(benchmark.results.reduce((acc, result) => acc + parseFloat(result.averageMemoryUsage || 0), 0));
                });

                // Create chart
                new Chart(document.getElementById(`${javascriptType.replace(/\s+/g, '')}Chart`), {
                    type: 'bar',
                    data: {
                        labels: chartLabels,
                        datasets: [
                            {
                                label: 'Execution Time (ms)',
                                data: chartDataExecutionTime,
                                backgroundColor: 'rgba(54, 162, 235, 0.6)',
                                borderColor: 'rgba(54, 162, 235, 1)',
                                borderWidth: 1
                            },
                            {
                                label: 'Memory Usage (KB)',
                                data: chartDataMemoryUsage,
                                backgroundColor: 'rgba(255, 99, 132, 0.6)',
                                borderColor: 'rgba(255, 99, 132, 1)',
                                borderWidth: 1
                            }
                        ]
                    },
                    options: {
                        responsive: true,
                        scales: {
                            y: {
                                beginAtZero: true
                            }
                        }
                    }
                });
            });

        } else {
            benchmarkResultsContainer.innerHTML = `<p>No benchmarks found.</p>`;
        }
    } catch (error) {
        console.error('Error fetching benchmarks:', error);
        benchmarkResultsContainer.innerHTML = `<p>Error loading benchmarks. Please try again later.</p>`;
    }
});
