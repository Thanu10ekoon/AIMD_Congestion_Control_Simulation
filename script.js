// --- State Variables ---
let time = 0;
let cwnd = 1;
let data = [{ time: time, cwnd: cwnd }];

// --- UI Highlight Logic ---
function triggerHighlight(actionType) {
    const boxInc = document.getElementById('def-increase');
    const boxDec = document.getElementById('def-decrease');
    
    // Reset both
    boxInc.classList.remove('active-increase');
    boxDec.classList.remove('active-decrease');

    // Apply specific highlight
    if (actionType === 'increase') {
        boxInc.classList.add('active-increase');
    } else if (actionType === 'decrease') {
        boxDec.classList.add('active-decrease');
    }
}

// --- D3 Chart Setup ---
const margin = { top: 20, right: 30, bottom: 40, left: 50 };
// Reduced width slightly to fit the side panel better
const width = 600 - margin.left - margin.right; 
const height = 400 - margin.top - margin.bottom;

const svg = d3.select("#chart")
    .append("svg")
    .attr("width", "100%") // Make SVG responsive
    .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

const x = d3.scaleLinear().range([0, width]);
const y = d3.scaleLinear().range([height, 0]);

const xGridGroup = svg.append("g").attr("class", "grid").attr("transform", `translate(0,${height})`);
const yGridGroup = svg.append("g").attr("class", "grid");
const xAxisGroup = svg.append("g").attr("transform", `translate(0,${height})`);
const yAxisGroup = svg.append("g");

svg.append("text").attr("text-anchor", "end").attr("x", width).attr("y", height + 35).text("Time (RTT)");
svg.append("text").attr("text-anchor", "end").attr("transform", "rotate(-90)").attr("y", -35).attr("x", 0).text("Congestion Window (cwnd)");

const line = d3.line().x(d => x(d.time)).y(d => y(d.cwnd));
const path = svg.append("path").attr("fill", "none").attr("stroke", "#2563eb").attr("stroke-width", 2.5);

function updateChart() {
    x.domain([0, Math.max(10, d3.max(data, d => d.time))]);
    y.domain([0, Math.max(10, d3.max(data, d => d.cwnd))]);

    xGridGroup.transition().duration(300).call(d3.axisBottom(x).tickSize(-height).tickFormat(""));
    yGridGroup.transition().duration(300).call(d3.axisLeft(y).tickSize(-width).tickFormat(""));
    xAxisGroup.transition().duration(300).call(d3.axisBottom(x));
    yAxisGroup.transition().duration(300).call(d3.axisLeft(y));

    path.datum(data).transition().duration(300).attr("d", line);

    const circles = svg.selectAll("circle").data(data);
    circles.enter()
        .append("circle")
        .attr("r", 4)
        .attr("fill", "#ef4444")
        .merge(circles)
        .transition().duration(300)
        .attr("cx", d => x(d.time))
        .attr("cy", d => y(d.cwnd));

    circles.exit().remove();
}

// --- Button Event Listeners ---
document.getElementById("btn-step").addEventListener("click", () => {
    time++;
    cwnd++;
    data.push({ time: time, cwnd: cwnd });
    updateChart();
    triggerHighlight('increase');
});

document.getElementById("btn-loss").addEventListener("click", () => {
    time++;
    cwnd = Math.max(1, Math.floor(cwnd / 2));
    data.push({ time: time, cwnd: cwnd });
    updateChart();
    triggerHighlight('decrease');
});

document.getElementById("btn-reset").addEventListener("click", () => {
    time = 0;
    cwnd = 1;
    data = [{ time: time, cwnd: cwnd }];
    updateChart();
    triggerHighlight('reset'); // Clears both
});

// Initial render
updateChart();