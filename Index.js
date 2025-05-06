const baseUrl = "https://www.elprisenligenu.dk/api/v1/prices/";

Vue.createApp({
  data() {
    return {
      items: [], // al data fra API
      item  : null, // et enkelt item fra API

    


    };
  },
 //instansiering
  async created() {
    console.log("App initialized");
    this.getAllItems();
    this.GetPriceNow();
  },
  methods: {
    // henter alle fra API, bruges til at opdaterer tabeller efter en delete/post eller put
    getAllItems() {
        url = baseUrl + "2025/05-06_DK2.json"
      this.getItems(url);
    },

    // henter alle fra api
    async getItems(url) {
      try {
        const response = await axios.get(url);
        this.items = response.data;
      } catch (ex) {
        alert("Error in getItems: " + ex.message);
      }
    },
    // henter et enkelt item fra api
    GetPriceNow() {
      
      
    }
  }
}).mount('#app');