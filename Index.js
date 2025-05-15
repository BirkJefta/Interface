// const baseUrl = "https://etrest-eaf7c7abe8hkdgh8.northeurope-01.azurewebsites.net/api/Elpris/";
const baseUrl = "https://etrest-eaf7c7abe8hkdgh8.northeurope-01.azurewebsites.net/swagger/v1/swagger.json"
Vue.createApp({
  data() {
    return {
      item: null,
      items: [],
      TimeNow: "",
      IsDataLoaded: false,
      prisklasse: "",
      displayTime: "",
      chart: null, // Reference to the Chart.js instance
    };
  },
  async created() {
    console.log("App initialized");
    this.getHour();
    await this.getHourlyItem();
    this.FormatTime();
  },
  mounted() {
    this.createChart(); // Initialize the chart when the component is mounted
  },
  methods: {
    async getHourlyItem() {
      let urlpris = this.prisklasse || "West";
      const url = `${baseUrl}/${urlpris}/${this.TimeNow}`;
      this.item = await this.getFromRest(url);
      console.log("Data hentet i getHourlyItem:", this.item);

      console.log("Data hentet i getHourlyItem:", this.item);
      if (this.items && this.items.length > 0) {
        this.updateChart(); // Opdater grafen med de hentede data
      }

    },
    async getFromRest(url) {
      try {
        const response = await axios.get(url);
        console.log(response.data);
        if (response.data != null) {
          this.IsDataLoaded = true;
        }
        return response.data;
      } catch (ex) {
        this.items = [];
        this.item = "";
        alert("Error, could not retrieve data: " + ex.message);
      }
    },
    updateChart() {
      if (!this.item || this.item.length === 0) {
        console.error("No data available to update the chart.");
        return;
      }
      const labels = this.item.map(item => {
        const date = new Date(item.time_start);
        return `${date.getHours()}:00`;
      });
      const data = this.items.map(item => item.DKK_per_kWh); // Brug DKK_per_kWh som data

      if (this.chart) {
        this.chart.destroy(); // vi rydder den gamle graf 
      }

      // vi initialiserer grafen
      const ctx = document.getElementById("myChart").getContext("2d");
      this.chart = new Chart(ctx, {
        type: "line", // Type of chart
        data: {
          labels: labels, // X-axis labels
          datasets: [
            {
              label: "Energy Prices (DKK/kWh)",
              data: data, // Y-axis data
              borderColor: "rgba(75, 192, 192, 1)",
              backgroundColor: "rgba(75, 192, 192, 0.2)",
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              display: true,
              position: "top",
            },
          },
          scales: {
            x: {
              beginAtZero: true,
            },
            y: {
              beginAtZero: true,
            },
          },
        },
      });
    }


  },

}).mount("#app");