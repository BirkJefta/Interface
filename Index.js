const baseUrl = "https://etrest-eaf7c7abe8hkdgh8.northeurope-01.azurewebsites.net/api/Elpris/";

Vue.createApp({
  data() {
    return {
      item  : null, // et enkelt item fra API
      items: [],
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
    this.FormatTime();
    
  },
  methods: {
    // henter alle fra API
     async getHourlyItem() {
      var urlpris = "";
      
      if (this.prisklasse === "") {
        urlpris = "West";
      }
      else{
        urlpris = this.prisklasse;
      }
      url = baseUrl +"/" + urlpris + "/" + this.TimeNow;
      this.item = await this.getFromRest(url)
      console.log("Data hentet i getHourlyItem:", this.item);
    },

    // henter alle fra api
    async getFromRest(url) {
      try {
        const response = await axios.get(url);
        console.log(response.data);
        if(response.data != null) { 
          this.IsDataLoaded = true;
        }
        return response.data;
       
      } catch (ex) {
        this.items = [];
        this.item = "";
        alert("Error, could not retrieve data: " + ex.message);
      }
    },
    async getAllItems() {
      var urlpris = "";
      
      if (this.prisklasse === "") {
        urlpris = "West";
      }
      else{
        urlpris = this.prisklasse;
      }
      url = baseUrl + "/" + "All" + this.prisklasse;
      this.items = await this.getFromRest(url);
    },
    async handleSelect(){
      await this.getHourlyItem();
      await this.getAllItems();
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