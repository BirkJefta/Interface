const baseUrl = "https://etrest-eaf7c7abe8hkdgh8.northeurope-01.azurewebsites.net/api/Elpris/";

Vue.createApp({
  data() {
    return {
      withoutTransportFee: true,
      itemsWest: [],
      itemsEast: [],
      item: null,
      TimeNow: "",
      IsDataLoaded: false,
      displayTime: "",
      chart: null,
      prisklasse: "West",
      backgroundColor:""
    };
  },

  async created() {
    this.getHour();
    await this.getAll();
    console.log(this.item);
    this.updateChart();
    this.colorByCategory();
    console.log(this.item.category);
    console.log(this.backgroundColor);
  },

  methods: {
    getHour() {
      const hour = new Date().getHours();
      this.TimeNow = hour;
    },

    async getAll() {
      try {
        urlWest = baseUrl + "All" + "/" + "West";
        urlEast = baseUrl + "All" + "/" + "East";
        this.itemsWest = await this.getFromRest(urlWest);
        this.itemsEast = await this.getFromRest(urlEast);
        if (this.itemsWest.length > 0 && this.itemsEast.length > 0) {
          this.IsDataLoaded = true;
        }
        this.getCurrentHourItem();
        this.FormatTime();
      } catch (error) {
        console.error("Fejl ved hentning:", error);
        this.IsDataLoaded = false;
      }
    },

    getCurrentHourItem() {
      this.getHour();
      if(this.prisklasse === "West") {
        this.item = this.itemsWest[this.TimeNow]
      }
      else if(this.prisklasse === "East") {
        this.item = this.itemsEast[this.TimeNow]
      }
      else {
        alert("could not get current data")
      }
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
      this.getCurrentHourItem();
      if (this.item) {
        this.FormatTime();
      }
      this.updateChart();
    },
    colorByCategory() {
      if (this.item.category === "high"){
        this.backgroundColor = "red";
      }
      else if (this.item.category === "medium"){
        this.backgroundColor = "yellow";
      }
      else if (this.item.category === "low"){
        this.backgroundColor = "green";
      }
      else {
        this.backgroundColor = "white";
      }
    },

    updateChart() {
      const fullHourLabels = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}`);

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

      // Slet og genskab canvas korrekt
      if (this.chart) {
        this.chart.destroy();
        this.chart = null;

        const canvas = document.getElementById("myChart");
        const parent = canvas.parentNode;
        canvas.remove();

        const newCanvas = document.createElement("canvas");
        newCanvas.id = "myChart";
        parent.appendChild(newCanvas);
      }

      // Nu opret context EFTER canvas er genskabt
      const ctx = document.getElementById("myChart").getContext("2d");

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
