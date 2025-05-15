const baseUrl = "https://etrest-eaf7c7abe8hkdgh8.northeurope-01.azurewebsites.net/api/Elpris/All/";

Vue.createApp({
  data() {
    return {
      itemsWest: [],
      itemsEast: [],
      item: null,
      TimeNow: "",
      IsDataLoaded: false,
      displayTime: "",
      chart: null,
      prisklasse: "West", // Bruges sammen med dropdown
    };
  },

  async created() {
    this.getHour();
    await this.getBothRegions();
    this.updateChart(); // vis standard: Vest
  },

  methods: {
    getHour() {
      const hour = new Date().getHours();
      this.TimeNow = hour;
    },

    async getBothRegions() {
      try {
        const [west, east] = await Promise.all([
          this.getFromRest(`${baseUrl}West`),
          this.getFromRest(`${baseUrl}East`)
        ]);

        this.itemsWest = west;
        this.itemsEast = east;
        this.IsDataLoaded = true;

        this.item = this.getCurrentHourItem(west); // vis Vest ved opstart
        this.FormatTime();
      } catch (error) {
        console.error("Fejl ved hentning:", error);
        this.IsDataLoaded = false;
      }
    },

    getCurrentHourItem(data) {
      const currentHour = new Date().getHours();
      return data.find(item => new Date(item.time_start).getHours() === currentHour);
    },

    async getFromRest(url) {
      try {
        const response = await axios.get(url);
        return response.data;
      } catch (ex) {
        console.error("API-fejl:", ex.response?.status, ex.response?.data);
        alert("Error retrieving data: " + ex.message);
        return [];
      }
    },

    FormatTime() {
      if (!this.item || !this.item.time_start) return;
      const date = new Date(this.item.time_start);
      this.displayTime = new Intl.DateTimeFormat("da-DK", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    },

    handleSelect() {
      const selectedData = this.prisklasse === "West" ? this.itemsWest : this.itemsEast;
      this.item = this.getCurrentHourItem(selectedData);
      this.FormatTime();
      this.updateChart();
    },

    updateChart() {
      const fullHourLabels = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);

      const pricesByHour = (items) => {
        const map = new Map(
          items.map(item => [new Date(item.time_start).getHours(), item.dkK_per_kWh])
        );
        return Array.from({ length: 24 }, (_, i) => map.get(i) ?? null);
      };

      const selectedData = this.prisklasse === 'West' ? this.itemsWest : this.itemsEast;
      const dataSetLabel = this.prisklasse === 'West' ? 'Vest (DKK/kWh)' : 'Øst (DKK/kWh)';
      const chartColor = this.prisklasse === 'West'
        ? { border: "rgba(54, 162, 235, 1)", background: "rgba(54, 162, 235, 0.2)" }
        : { border: "rgba(255, 99, 132, 1)", background: "rgba(255, 99, 132, 0.2)" };

      const data = pricesByHour(selectedData);

      const ctx = document.getElementById("myChart").getContext("2d");

      if (this.chart) {
        this.chart.destroy();
      }
      
      this.chart = new Chart(ctx, {
        type: "bar",
        data: {
          labels: fullHourLabels,
          datasets: [
            {
              label: dataSetLabel,
              data: data,
              borderColor: chartColor.border,
              backgroundColor: chartColor.background,
              borderWidth: 2,
              tension: 0.3,
              spanGaps: true
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          scales: {
            x: {
              title: {
                display: true,
                text: "Tidspunkt"
              },
              ticks: {
                autoSkip: false,
                maxRotation: 0,
                minRotation: 0
              }
            },
            y: {
              min: -0.2,
              max: 1.2,
              ticks: {
                stepSize: 0.2
              },
              title: {
                display: true,
                text: "Pris (DKK/kWh)"
              }
            }
          },
          plugins: {
            legend: {
              position: "top"
            }
          }
        }
      });
    }
  }
}).mount("#app");

