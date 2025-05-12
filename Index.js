const baseUrl = "etrest-eaf7c7abe8hkdgh8.northeurope-01.azurewebsites.net";

Vue.createApp({
  data() {
    return {
      items: [], // al data fra API
      item: null, // et enkelt item fra API
      TimeNow: "", // nuværende tidspunkt\
      IsDataLoaded: false, // true når data er loaded
      prisklasse: "", // prisklasse fra API
      error: null
    };
  },
 //instansiering
  async created() {
    console.log("App initialized");
    this.FormatTime();
    await this.getAllItems(); 
    
  },
  methods: {
    
    // henter alle fra API, bruges til at opdaterer tabeller efter en delete/post eller put
     async getAllItems() {
      var urlpris = "";
      
      if (this.prisklasse === "" || this.prisklasse === "DK1") {
        urlpris = "DK1";
      }
      else{
        urlpris = this.prisklasse;
      }
      var hour = new Date().getHours();
        url = baseUrl + "/" + urlpris + "/" + hour;
        console.log(url)
       await this.getItems(url);
    },

    // henter alle fra api
    async getItems(url) {
      try {
        const response = await axios.get(url);
        this.items = response.data;
        if(this.items.length> 0) { 
          this.IsDataLoaded = true;
          this.GetPriceNow();
        } 
      } catch (ex) {
        this.items = [];
        alert("Error, could not retrieve data: " + ex.message);
      }
    },
    
    // henter et enkelt item fra api
    GetPriceNow() { 
      const hour = new Date().getHours()
      const Index  = parseInt(hour)

      this.item = this.items[Index];
    },
    
    FormatTime() { 
      const date= new Date();
      const formated = new Intl.DateTimeFormat('da-DK',{
        day: '2-digit', 
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit', 
      }).format(date);
      this.TimeNow = formated;
        console.log(this.TimeNow)
      
    },
  }
}).mount('#app');