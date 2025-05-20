const baseUrl = "https://etrest-eaf7c7abe8hkdgh8.northeurope-01.azurewebsites.net/api/Elpris/";

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
      prisklasse: "West",
      backgroundColor: "",
      priceintervalToSend: { "id": 2, "high": null, "low": null },
      formError: "",
      formsuccess: "",
    };
  },

  async created() {
    await this.loadData();
  },

  methods: {
    async loadData() {
      this.getHour();
      await this.getAll();
      console.log(this.item);
      this.updateChart();
      this.colorByCategory();

    },
    getHour() {
      const hour = new Date().getHours();
      this.TimeNow = hour;
    },

    async getAll() {
      try {
        urlWest = baseUrl + "All" + "/" + "West";
        urlEast = baseUrl + "All" + "/" + "East";
        while (this.IsDataLoaded === false) {
          this.itemsWest = await this.getFromRest(urlWest);
          this.itemsEast = await this.getFromRest(urlEast);
          if (this.itemsWest.length > 0 && this.itemsEast.length > 0) {
          this.IsDataLoaded = true;
          }
          else {
          const response = await axios.get(baseUrl +  "/" + "FromAPI");
            if (response.status === 204 && i < 5) {
              i++;
              this.getAll()
            }
          }
        
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
      if (this.prisklasse === "West") {
        this.item = this.itemsWest[this.TimeNow]
      }
      else if (this.prisklasse === "East") {
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
    async sendPrice() {
      this.formError = "";
      const high = this.priceintervalToSend.high;
      const low = this.priceintervalToSend.low;
      // til at håndtere decimaler
      if (typeof high === "string") {
       this.priceintervalToSend.high = parseFloat(high.replace(",", "."));
      }
      if (typeof low === "string") {
        this.priceintervalToSend.low = parseFloat(low.replace(",", "."));
      }
      // fejlbeskede til tomme felter
      if (high === "" || low === "" || high == null || low == null) {
        this.formError = "Enter both high and low value.";
        return;
      }

      if (this.priceintervalToSend.high !== null && this.priceintervalToSend.low !== null) {
        try {
          console.log(this.priceintervalToSend);
          const response = await axios.put(baseUrl, this.priceintervalToSend);
          console.log(response);
          this.formsuccess = "success";
          await this.loadData();
        } catch (ex) {
          console.error("API-fejl:", ex.response?.status, ex.response?.data);
          alert("Error retrieving data: " + ex.message);
          return [];
        }
      }
    },
    colorByCategory() {
      if (this.item.category === "high") {
        this.backgroundColor = "#dc143c";
      }
      else if (this.item.category === "medium") {
        this.backgroundColor = "#ffd700";
      }
      else if (this.item.category === "low") {
        this.backgroundColor = "#2e8b57";
      }
      else {
        this.backgroundColor = "white";
      }
    },

    updateChart() {

      const selectedData = this.prisklasse === 'West' ? this.itemsWest : this.itemsEast;
      const dataSetLabel = this.prisklasse === 'West' ? 'West (DKK/kWh)' : 'East (DKK/kWh)';
      console.log(this.itemsEast);
      const data = [];
      const labels = [];
      const backgroundColors = [];
      for (let i = 0; i < 24; i++) {
        labels.push(i.toString().padStart(2, '0'));
      };
      selectedData.forEach(element => {
        data.push(element.dkK_per_kWh);

        let color = 'gray';
        if (element.category === 'high') color = '	#dc143c';
        else if (element.category === 'medium') color = '#ffd700';
        else if (element.category === 'low') color = '#2e8b57';
        backgroundColors.push(color);
      });
      const maxY = Math.max(...data) + 0.05;
      const minY = Math.min(...data) - 0.05;

      // Sletter og laver chart igen
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
          labels: labels,
          datasets: [
            {
              label: dataSetLabel,
              data: data,
              backgroundColor: backgroundColors,
              borderWidth: 1,
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
                text: "Time (Hour)"
              },
              ticks: {
                autoSkip: false,
                maxRotation: 0,
                minRotation: 0
              }
            },
            y: {
              min: minY,
              max: maxY,
              ticks: {
                stepSize: 0.2
              },
              title: {
                display: true,
                text: "Price (DKK/kWh)"
              }
            }
          },
        }
      });
    }
  }
}).mount("#app");
