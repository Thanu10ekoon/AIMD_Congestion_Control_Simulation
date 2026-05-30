// --- 1. State Variables ---
let time = 0;
let cwnd = 1;
let data = [{ time: time, cwnd: cwnd }];

// --- 2. D3 Chart Setup ---
const margin = { top: 20, right: 30, bottom: 40, left: 50 };
const width = 700 - margin.left - margin.right;
const height = 400 - margin.top - margin.bottom;

const svg = d3.select("#chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// X and Y scales
const x = d3.scaleLinear().range([0, width]);
const y = d3.scaleLinear().range([height, 0]);

// --- NEW: Grid Groups ---
// Note: We append these BEFORE the main line path so the grid stays in the background
const xGridGroup = svg.append("g")
    .attr("class", "grid")
    .attr("transform", `translate(0,${height})`);

const yGridGroup = svg.append("g")
    .attr("class", "grid");

// Axis Groups
const xAxisGroup = svg.append("g").attr("transform", `translate(0,${height})`);
const yAxisGroup = svg.append("g");

// Labels
svg.append("text").attr("text-anchor", "end").attr("x", width).attr("y", height + 35).text("Time (RTT)");
svg.append("text").attr("text-anchor", "end").attr("transform", "rotate(-90)").attr("y", -35).attr("x", 0).text("Congestion Window (cwnd)");

// Line Generator
const line = d3.line()
    .x(d => x(d.time))
    .y(d => y(d.cwnd));

const path = svg.append("path")
    .attr("fill", "none")
    .attr("stroke", "#2563eb")
    .attr("stroke-width", 2.5);

// --- 3. Update Function ---
function updateChart() {
    x.domain([0, Math.max(10, d3.max(data, d => d.time))]);
    y.domain([0, Math.max(10, d3.max(data, d => d.cwnd))]);

    // --- NEW: Animate Grid updates ---
    // tickSize(-height) draws the vertical lines up across the chart
    xGridGroup.transition().duration(300).call(
        d3.axisBottom(x).tickSize(-height).tickFormat("")
    );
    
    // tickSize(-width) draws the horizontal lines right across the chart
    yGridGroup.transition().duration(300).call(
        d3.axisLeft(y).tickSize(-width).tickFormat("")
    );

    // Animate axis updates
    xAxisGroup.transition().duration(300).call(d3.axisBottom(x));
    yAxisGroup.transition().duration(300).call(d3.axisLeft(y));

    // Animate line update
    path.datum(data).transition().duration(300).attr("d", line);

    // Update dots
    const circles = svg.selectAll("circle").data(data);
    circles.enter()
        .append("circle")
        .attr("r", 4)
        .attr("fill", "#ef4444")
        .merge(circles)
        .transition()
        .duration(300)
        .attr("cx", d => x(d.time))
        .attr("cy", d => y(d.cwnd));

    circles.exit().remove();
}

// --- 4. Button Event Listeners ---
document.getElementById("btn-step").addEventListener("click", () => {
    time++;
    cwnd++;
    data.push({ time: time, cwnd: cwnd });
    updateChart();
});

document.getElementById("btn-loss").addEventListener("click", () => {
    time++;
    cwnd = Math.max(1, Math.floor(cwnd / 2));
    data.push({ time: time, cwnd: cwnd });
    updateChart();
});

document.getElementById("btn-reset").addEventListener("click", () => {
    time = 0;
    cwnd = 1;
    data = [{ time: time, cwnd: cwnd }];
    updateChart();
});

// Initial render
updateChart();