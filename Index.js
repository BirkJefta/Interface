const baseUrl = "https://www.elprisenligenu.dk/api/v1/prices/";

Vue.createApp({
  data() {
    return {
      items: [], // al data fra API
      item  : null, // et enkelt item fra API
      TimeNow: "", // nuværende tidspunkt\
      IsDataLoaded: false, // true når data er loaded
      prisklasse: "" // prisklasse fra API

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
      
      if (this.prisklasse === "") {
        urlpris = "DK1";
      }
      else{
        urlpris = this.prisklasse;
      }
      var year = new Date().getFullYear();
      var month = new Date().getMonth() + 1; // getMonth() returns month from 0-11
      var day = new Date().getDate(); // getDate() returns day from 1-31
      if (month < 10) {
        month = "0" + month; // add leading zero if month is less than 10
      } 
      if (day < 10) {
        day = "0" + day; // add leading zero if day is less than 10
      }
      console.log(day);
        url = baseUrl + year + "/" + month + "-" + day + "_" + urlpris + ".json"
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
        alert("Error in getItems: " + ex.message);
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