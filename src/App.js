import React, { useState, useEffect } from 'react'
import RacingBarChart from "./RacingBarChart"
import Papa from 'papaparse'
import { FaPauseCircle } from "react-icons/fa";
import { FaPlayCircle } from "react-icons/fa";
import "./App.css"


const App = () => {
  const startYear = 1950
  const endYear = 2021
  const [currentYear, setCurrentYear] = useState(startYear)
  const [rawData, setRawData] = useState({})
  // const [rawData2, setRawData2] = useState()
  const [data, setData] = useState([])
  // const [data2, setData2] = useState([])
  const [total, setTotal] = useState(0)
  const [stop, setStop] = useState(false)
  const [hover, setHover] = useState(false);
  

  // Retrive raw data from csv
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
      })
      // filter out some countries
      parsedData.data = parsedData.data.filter(item => {
        const filterOutCountries = ["dev", "income","Asia", "(UN)"]
        return !filterOutCountries.some(substring => item["Country name"].includes(substring))
      })
    
      // map raw data
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
        tempRawData[item.year] = []
        tempRawData[item.year] = []
       }
       tempRawData[item.year].push(item)
      })

      const colors = [
        '#ff6384', '#36a2eb', '#cc65fe', '#ffce56',
        '#4bc0c0', '#ff9f40', '#ffcd56', '#c9cbcf',
        '#9970ff', '#ff6384', '#36a2eb', '#cc65fe',
      ]
      // let temRawData2 = tempRawData

      Object.keys(tempRawData).forEach(year => {
        tempRawData[year].sort((a, b) => b.population - a.population)
        tempRawData[year] = tempRawData[year].slice(0, 12).map((item, index) => {
         return item = {
            ...item,
            color: colors[index]
          }
        })
      })

      setRawData(tempRawData)
      // setRawData2(temRawData2)
      setData(tempRawData[startYear])
      // setData2(temRawData2[startYear])
    }
    fetchData();
  }, []);

  // set next data
  useEffect(() => {
    let intervalId;
    if (!stop) {
      intervalId = setInterval(() => {
        setCurrentYear(prevYear => prevYear < endYear ? prevYear + 1 : startYear);
      }, 500);
    }
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [stop, endYear, startYear]);

  useEffect(() => {
    setData(rawData[currentYear]);
  
    let sumPopulation = 0;
    rawData[currentYear]?.forEach(item => {
      sumPopulation += item.population;
    });
    setTotal(sumPopulation);
  }, [currentYear, rawData,data]);

//   useEffect(() => {
//     const intervalId = setInterval(() => {
//         setCurrentYear(prevYear => prevYear < endYear ? prevYear + 1 : 1950)
//         setData(rawData[currentYear])
//         // setData2(rawData2[currentYear])
//         let sumPopulation = 0
//         data.forEach(item => {
//           sumPopulation = sumPopulation + item.population
//         })
//         setTotal(sumPopulation)
//     }, 500);
//     return () => clearInterval(intervalId);
// }, [currentYear,data,rawData])

  const hoverStyle = {
    color: hover ? 'red' : 'black',
    cursor: 'pointer',
    width:'3rem', 
    height:"3rem"
  }

  return (
    <React.Fragment>
      <div style={{display:"flex",flexDirection:"column"}}>
        <h2>Population growth per country, 1950 to 2021</h2>
        <RacingBarChart data={rawData[currentYear]} />
        <div style={{display:"flex",justifyContent:"space-between", }}>
          {!stop && <FaPauseCircle style={hoverStyle}
            onMouseEnter={() => setHover(true)} 
            onMouseLeave={() => setHover(false)}
            onClick={() => setStop(!stop)}/>
          }
          {stop && <FaPlayCircle style={hoverStyle}
            onMouseEnter={() => setHover(true)} 
            onMouseLeave={() => setHover(false)}
            onClick={() => setStop(!stop)}/>
          }
          <div style={{marginRight:"15rem"}}>
            <div>{currentYear}</div>
            <div>Total: {total.toLocaleString('en-US')}</div>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
}
export default App;
