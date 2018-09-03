
d3.select(window).on("resize", makeResponsive);

makeResponsive();

function makeResponsive() {

    var svgArea = d3.select("body").select("svg");
    if (!svgArea.empty()) {
        svgArea.remove();
    }

    var svgWidth = 600;
    var svgHeight = 400;

    var margin = {
        top: 20,
        right: 40,
        bottom: 60,
        left: 100
    };

    var width = svgWidth - margin.left - margin.right;
    var height = svgHeight - margin.top - margin.bottom;

    var svg = d3.select(".chart")
        .append("svg")
        .attr("width", svgWidth)
        .attr("height", svgHeight);

    var chartGroup = svg.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);


    d3.csv("https://raw.githubusercontent.com/alyssflynn/data-journalism/master/data/data.csv").then(successHandle, errorHandle);

    function errorHandle(error) {
        throw error;
    }

    function successHandle(csvData) {

        csvData.forEach(function (data) {
            data.income = +data.income;
            data.smokes = +data.smokes;
        });

        var xLinearScale = d3.scaleLinear()
            .domain([d3.min(csvData, d => d.income) - 10000, d3.max(csvData, d => d.income)])
            .range([0, width]);

        var yLinearScale = d3.scaleLinear()
            .domain([0, d3.max(csvData, d => d.smokes)])
            .range([height, 0]);


        var bottomAxis = d3.axisBottom(xLinearScale);
        var leftAxis = d3.axisLeft(yLinearScale);

        chartGroup.append("g")
            .attr("transform", `translate(0, ${height})`)
            .call(bottomAxis);

        chartGroup.append("g")
            .call(leftAxis);

        var circlesGroup = chartGroup.selectAll("circle")
            .data(csvData)
            .enter()
            .append("circle")
            .attr("cx", d => xLinearScale(d.income))
            .attr("cy", d => yLinearScale(d.smokes))
            .attr("r", "12")
            .attr("fill", "blue")
            .attr("opacity", ".5");

        var toolTip = d3.tip()
            .attr("class", "tooltip")
            .offset([80, -60])
            .html(function (d) {
                return (`${d.state}<br>Med. Income: ${d.income}<br>Percent smokers: ${d.smokes}`);
            });
        chartGroup.call(toolTip);

        // Event listeners to display and hide the tooltip
        circlesGroup.on("click", function (data) {
            toolTip.show(data);
        })
            .on("mouseout", function (data, index) {
                toolTip.hide(data);
            });

        // Create axes labels
        chartGroup.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left + 45)
            .attr("x", 0 - (height / 2))
            .attr("dy", "1em")
            .attr("class", "axisText")
            .text("Percent Smokers");

        chartGroup.append("text")
            .attr("transform", `translate(${width / 2}, ${height + margin.top + 20})`)
            .attr("class", "axisText")
            .text("Average Income");

        // event listener for mouseover
        circlesGroup.on("mouseover", function() {
            d3.select(this)
                  .attr("fill", "green");
          })
          // event listener for mouseout
          .on("mouseout", function() {
            d3.select(this)
                  .attr("fill", "blue");
        });
    }

}
