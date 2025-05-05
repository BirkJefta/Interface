const baseUrl = 

Vue.createApp({
  data() {
    return {
      items: [], // al data fra API
      idToGetBy: -1,
      singleItem: null, // til getbyid
      deleteMessage: null,
      deleteId: 0,
      newItem: { name: "", value: 0 }, // til POST altså nye items
      addMessage: "",
      updateData: { id: 0, name: "", value: 0 }, // til PUT altså redigere
      updateMessage: ""
    };
  },
 //instansiering
  async created() {
    console.log("App initialized");
    this.getAllItems();
  },
  methods: {
    // henter alle fra API, bruges til at opdaterer tabeller efter en delete/post eller put
    getAllItems() {
      this.getItems(baseUrl);
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
  }
}).mount('#app');