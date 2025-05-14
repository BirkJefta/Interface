const baseUrl = "https://etrest-eaf7c7abe8hkdgh8.northeurope-01.azurewebsites.net/api/Elpris/";

Vue.createApp({
  data() {
    return {
      item  : null, // et enkelt item fra API
      TimeNow: "", // nuværende tidspunkt\
      IsDataLoaded: false, // true når data er loaded
      prisklasse: "", // prisklasse fra API
      displayTime: ""
    };
  },
 //instansiering
  async created() {
    console.log("App initialized");
    this.getHour();
    await this.getHourlyItem(); 
    
  },
  methods: {
    // henter alle fra API, bruges til at opdaterer tabeller efter en delete/post eller put
     async getHourlyItem() {
      var urlpris = "";
      
      if (this.prisklasse === "") {
        urlpris = "West";
      }
      else{
        urlpris = this.prisklasse;
      }
      url = baseUrl +"/" + urlpris + "/" + this.TimeNow;
       await this.getItem(url)

    },
    // henter alle fra api
    async getItem(url) {
      try {
        const response = await axios.get(url);
        this.item = response.data;
        if(this.item != null) { 
          this.IsDataLoaded = true;
          this.FormatTime();
        } 
      } catch (ex) {
        alert("Error in getItems: " + ex.message);
      }
    },
    // henter et enkelt item fra api
    getHour() { 
      const hour = new Date().getHours()
      this.TimeNow = parseInt(hour)
    },
     FormatTime() { 
      const date= new Date(this.item.time_start);
      const formated = new Intl.DateTimeFormat('da-DK',{
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);
      this.displayTime = formated;
        console.log(this.TimeNow)
      
    }

  }
}).mount('#app');