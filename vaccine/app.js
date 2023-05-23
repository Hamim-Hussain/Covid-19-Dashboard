// 1. Use the D3 library to read in the JSON data
const file = "clean_df.json";
const dataPromise = d3.json(file);
console.log("Data Promise: ", dataPromise);

// Create bar charts, scatter plot, and table with dropdown menus
dataPromise.then(function(data) {
  // Extract unique continents and dates from the data
  let uniqueContinents = [...new Set(data.map(d => d.continent))];
  let uniqueDates = [...new Set(data.map(d => d.date))];

  // Select the dropdown menus for continent and date
  let continentDropdown = d3.select("#continentDropdown");
  let dateDropdown = d3.select("#dateDropdown");

  // Populate the dropdown menus with options
  uniqueContinents.forEach(function(continent) {
    continentDropdown.append("option")
      .text(continent)
      .property("value", continent);
  });

  uniqueDates.forEach(function(date) {
    dateDropdown.append("option")
      .text(date)
      .property("value", date);
  });

  // Set the default values for continent and date
  let defaultContinent = uniqueContinents[0];
  let defaultDate = uniqueDates[0];

  // Call the updateBarCharts, updateScatterPlot, and updateTable functions to create the initial charts and table
  updateBarCharts(defaultContinent, defaultDate);
  updateScatterPlot(defaultContinent, defaultDate);
  updateTable(defaultContinent, defaultDate);

  // Define the updateBarCharts function to update the bar charts when the dropdown menus are changed
  function updateBarCharts(continent, date) {
    // Filter the data based on the selected continent and date
    let filteredData = data.filter(d => d.continent === continent && d.date === date);

    // Sort the filtered data based on the people_vaccinated_per_hundred metric in descending order
    filteredData.sort((a, b) => b.people_vaccinated_per_hundred - a.people_vaccinated_per_hundred);

    let locations = filteredData.map(d => d.location);
    let vaccinatedValues = filteredData.map(d => d.people_vaccinated_per_hundred);
    let percentages = filteredData.map(d => (d.people_fully_vaccinated / d.population) * 100);

    // Create the trace for the vaccinated per hundred bar chart
    let trace1 = {
      x: vaccinatedValues,
      y: locations,
      type: "bar",
      orientation: "h",
      name: "Vaccinated per Hundred"
    };

    // Create the trace for the percentage fully vaccinated bar chart
    let trace2 = {
      x: percentages,
      y: locations,
      type: "bar",
      orientation: "h",
      name: "Percentage Fully Vaccinated"
    };

    // Define the layout for the bar charts
    let layout = {
      barmode: "group",
      title: "Vaccination Statistics by Location",
      xaxis: { title: "Value" },
      yaxis: {
        title: "Location",
        automargin: true,
        side: "left"
      },
      margin: {
        l: 50, // Increases the left margin to accommodate the y-axis label
        r: 50, // Increases the right margin for spacing
        t: 50, // Increases the top margin for spacing
        b: 50 // Increases the bottom margin for spacing
      }
    };

    // Set the dimensions of the bar chart container
    let container = document.getElementById("bar");
    container.style.width = "1400px";
    container.style.height = "800px";

    // Plot the bar charts
    Plotly.newPlot("bar", [trace1, trace2], layout, { responsive: true });
  }

  // Define the updateScatterPlot function to update the scatter plot when the dropdown menus are changed
  function updateScatterPlot(continent, date) {
    // Filter the data based on the selected continent and date
    let filteredData = data.filter(d => d.continent === continent && d.date === date);

    let gdpPerCapita = filteredData.map(d => d.gdp_per_capita);
    let vaccinatedValues = filteredData.map(d => d.people_vaccinated_per_hundred);
    let locations = filteredData.map(d => d.location); // Added line to get locations

    // Create the trace for the scatter plot
    let trace = {
      x: gdpPerCapita,
      y: vaccinatedValues,
      mode: "markers+text",
      type: "scatter",
      text: locations, // Use locations as the text labels
      textposition: 'top center',
      textfont: {
        family: 'Raleway, sans-serif'
      },
      marker: {
        size: 10,
        color: vaccinatedValues,
        colorscale: "Viridis",
        showscale: true
      },
      // Add custom hovertemplate to show the location in the tooltip
      hovertemplate: '<b>GDP per Capita:</b> %{x}<br><b>Vaccinated per Hundred:</b> %{y}'
    };

    // Define the layout for the scatter plot
    let layout = {
      title: "Correlation between GDP per Capita and Vaccinated per Hundred",
      xaxis: { title: "GDP per Capita" },
      yaxis: { title: "Vaccinated per Hundred" },
      margin: {
        l: 50, // Increases the left margin for spacing
        r: 50, // Increases the right margin for spacing
        t: 50, // Increases the top margin for spacing
        b: 50 // Increases the bottom margin for spacing
      }
    };

    // Set the dimensions of the scatter plot container
    let container = document.getElementById("scatter");
    container.style.height = "600px";

    // Plot the scatter plot
    Plotly.newPlot("scatter", [trace], layout, { responsive: true });
  }

  // Define the updateTable function to update the table when the dropdown menus are changed
  function updateTable(continent, date) {
    // Filter the data based on the selected continent and date
    let filteredData = data.filter(d => d.continent === continent && d.date === date);

    // Select the table body
    let tableBody = d3.select("#table tbody");

    // Remove existing rows from the table
    tableBody.html("");

    // Loop through the filtered data and add rows to the table
    filteredData.forEach(function(d) {
      // Create a new row
      let row = tableBody.append("tr");

      // Add cells to the row
      row.append("td").text(d.location);
      row.append("td").text(d.people_fully_vaccinated);
      row.append("td").text(d.people_vaccinated);
      row.append("td").text(d.population);
      row.append("td").text(d.total_cases);
    });
  }

  // Attach event listeners to the dropdown menus
  continentDropdown.on("change", function() {
    let selectedContinent = d3.select(this).property("value");
    let selectedDate = dateDropdown.property("value");

    updateBarCharts(selectedContinent, selectedDate);
    updateScatterPlot(selectedContinent, selectedDate);
    updateTable(selectedContinent, selectedDate);
  });

  dateDropdown.on("change", function() {
    let selectedContinent = continentDropdown.property("value");
    let selectedDate = d3.select(this).property("value");

    updateBarCharts(selectedContinent, selectedDate);
    updateScatterPlot(selectedContinent, selectedDate);
    updateTable(selectedContinent, selectedDate);
  });

  // Call the updateTable function to create the initial table
  updateTable(defaultContinent, defaultDate);
});

