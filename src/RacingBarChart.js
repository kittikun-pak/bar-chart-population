import React, { useRef, useEffect } from "react";
import { select, scaleBand, scaleLinear, max } from "d3";
import useResizeObserver from "./useResizeObserver";

 function RacingBarChart({ data }) {
  const svgRef = useRef();
  const wrapperRef = useRef();
  const dimensions = useResizeObserver(wrapperRef);

  // will be called initially and on every data change
  useEffect(() => {
    if (!data) {
        return // Check if the data for the current year exists
      }
    const svg = select(svgRef.current);
    if (!dimensions) return

    // sorting the data
    data.sort((a, b) => b.population - a.population);

    const yScale = scaleBand()
      .paddingInner(0.1)
      .domain(data.map((value, index) => index)) // [0,1,2,3,4,5]
      .range([0, dimensions.height]) // [0, 200]

    const xScale = scaleLinear()
      .domain([0, max(data, entry => entry.population * 2)]) // [0, 65 (example)]
      .range([0, dimensions.width]) // [0, 400 (example)]

    // draw the bars
    svg
      .selectAll(".bar")
      .data(data, (entry, index) => entry.country)
      .join(enter =>
        enter.append("rect").attr("y", (entry, index) => yScale(index))
      )
      .attr("fill", entry => entry.color)
      .attr("class", "bar")
      .attr("x", 0)
      .attr("height", yScale.bandwidth())
      .transition()
      .attr("width", entry => xScale(entry.population))
      .attr("y", (entry, index) => yScale(index));

    // draw the labels
    svg
      .selectAll(".label")
      .data(data, (entry, index) => entry.country)
      .join(enter =>
        enter
          .append("text")
          .attr(
            "y",
            (entry, index) => yScale(index) + yScale.bandwidth() / 2 + 5
          )
      )
      .text(entry => `${entry.country}`)
      .attr("class", "label")
      .attr("x", -100)
      .transition()
      .attr("y", (entry, index) => yScale(index) + yScale.bandwidth() / 2 + 5);
    
    // lable population and flag
    svg
      .selectAll(".label-flag")
      .data(data, (entry, index) => entry.country)
      .join(enter =>
        enter
          .append("text")
          .attr(
            "y",
            (entry, index) => yScale(index) + yScale.bandwidth() / 2 + 5
          )
      )
      .text(entry => `${entry.population.toLocaleString('en-US')}`)
      .attr("class", "label-flag")
      .attr("x", entry => xScale(entry.population))
      .transition()
      .attr("y", (entry, index) => yScale(index) + yScale.bandwidth() / 2 + 5)

  }, [data, dimensions]);
  

  return (
    <div ref={wrapperRef} style={{ marginBottom: "2rem" }}>
      <svg ref={svgRef} style={{marginLeft: "4rem"}}></svg>
    </div>
  );
}

export default RacingBarChart;
