const baseUrl = "https://www.elprisenligenu.dk/api/v1/prices/";

Vue.createApp({
  data() {
    return {
      items: [], // al data fra API
      item  : null, // et enkelt item fra API
      TimeNow: "", // nuværende tidspunkt\
      IsDataLoaded: false, // true når data er loaded
    };
  },
 //instansiering
  async created() {
    console.log("App initialized");
    this.FormatTime();
    await this.getAllItems(); 
    this.GetPriceNow();
  },
  methods: {
    // henter alle fra API, bruges til at opdaterer tabeller efter en delete/post eller put
     async getAllItems() {
        url = baseUrl + "2025/05-06_DK2.json"
       await this.getItems(url);

    },

    // henter alle fra api
    async getItems(url) {
      try {
        const response = await axios.get(url);
        this.items = response.data;
        if(this.items.length> 0) { 
          this.IsDataLoaded = true;
          console.log(this.IsDataLoaded)
        } 
      } catch (ex) {
        alert("Error in getItems: " + ex.message);
      }
    },
    // henter et enkelt item fra api
    GetPriceNow() { 
      const hour = new Date().getHours()
      this.TimeNow = parseInt(hour)

      this.item = this.items[this.TimeNow];
      console.log(this.item);
    },
    FormatTime() { 
      
      
    },

  }
}).mount('#app');