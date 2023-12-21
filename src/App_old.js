import React, { useState, useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import Papa from 'papaparse';

const YearlyGraph = () => {
    const chartRef = useRef(null);
    const [currentYear, setCurrentYear] = useState(1950);
    const chartInstanceRef = useRef(null);
    const maxYear = 2021;
    const [rawData, setRawData] = useState({})

    useEffect(() => {
      async function fetchData() {
        const response = await fetch('/population-and-demography.csv');
        const reader = response.body.getReader();
        const result = await reader.read(); // raw array
        const decoder = new TextDecoder('utf-8');
        const csv = decoder.decode(result.value); // the csv text
        const parsedData = Papa.parse(csv, {
          header: true, // if your CSV has a header row
          dynamicTyping: true, // if you want automatic type conversion
        });
        //
  
        parsedData.data = parsedData.data.map(item => {
          const new_item = {
            country: item["Country name"],
            year: item["Year"],
            population: item["Population"]
          }
          return new_item
        })

        let tempRawData  = {}
        parsedData.data.forEach(item => {
         if(!tempRawData[item.year]) {
          tempRawData[item.year] = {
            labels: [],
            data: []
          }
         }
         tempRawData[item.year].labels.push(item.country)
         tempRawData[item.year].data.push(item.population)
        })    

        setRawData(tempRawData);
      }
  
      fetchData();
    }, []);


    useEffect(() => {
        if (!rawData[currentYear]) {
          return; // Check if the data for the current year exists
        }
        if (chartInstanceRef.current) {
            //chartInstanceRef.current.destroy(); // Destroy the existing chart
        }

        const chartContext = chartRef.current.getContext('2d');
        chartInstanceRef.current = new Chart(chartContext, {
            type: 'bar',
            data: {
                labels: rawData[currentYear].labels,
                datasets: [{
                    label: `Sales Data ${currentYear}`,
                    backgroundColor: 'rgba(0, 123, 255, 0.5)',
                    borderColor: 'rgba(0, 123, 255, 1)',
                    data: rawData[currentYear].data
                }]
            },
            options: {
              indexAxis: 'y',
                scales: {
                    x: {
                        beginAtZero: true
                    }
                }
            }
        });

        return () => {
            if (chartInstanceRef.current) {
                chartInstanceRef.current.destroy();
            }
        };
    }, [currentYear,rawData]);

    useEffect(() => {
        const intervalId = setInterval(() => {
            setCurrentYear(prevYear => prevYear < maxYear ? prevYear + 1 : 1950);
        }, 1000); // Update every 5 seconds

        return () => clearInterval(intervalId);
    }, []);

    return (
        <div>
            <canvas ref={chartRef}></canvas>
        </div>
    );
}

export default YearlyGraph;
