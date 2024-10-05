<template>
    <div id="app">
      <h1>Procesador de Imágenes</h1>
      <input type="file" @change="onFileChange" accept="image/*" />
      <label>
        <input type="checkbox" v-model="conTraslape" />
        Con Traslape
      </label>
      <button @click="submitImage">Procesar Imagen</button>
  
      <div v-if="loading">Cargando...</div>
      <div v-if="error">{{ error }}</div>
  
      <h2>Resultados</h2>
      <div v-if="regiones.length">
        <ul>
          <li v-for="(region, index) in regiones" :key="index">
            Región {{ index + 1 }}: {{ region }} píxeles
          </li>
        </ul>
      </div>
  
      <h2>Gráfica</h2>
      <canvas ref="canvas"></canvas>
    </div>
  </template>
  
  <script>
  import axios from "axios";
  import { io } from "socket.io-client";
  
  export default {
    data() {
      return {
        selectedFile: null,
        conTraslape: false,
        loading: false,
        error: null,
        regiones: [],
        socket: null,
      };
    },
    mounted() {
      this.socket = io("http://localhost:5000"); // Cambia la URL si es necesario
      this.socket.on("nueva_data", (data) => {
        console.log(data);
        this.updateCanvas(data.regiones_count);
      });
    },
    beforeDestroy() {
      if (this.socket) {
        this.socket.disconnect();
      }
    },
    methods: {
      onFileChange(event) {
        this.selectedFile = event.target.files[0];
      },
      async submitImage() {
        if (!this.selectedFile) {
          this.error = "Por favor, selecciona una imagen.";
          return;
        }
  
        this.loading = true;
        this.error = null;
        const formData = new FormData();
        formData.append("imagen", this.selectedFile);
        formData.append("con_traslape", this.conTraslape);
  
        try {
          const response = await axios.post("http://localhost:5000/procesar_imagen", formData);
          this.regiones = response.data.regiones;
          this.loading = false;
  
          // Emitir evento para procesamiento en tiempo real
          this.socket.emit("procesar_y_graficar", {
            file_path: response.data.file_path,
            con_traslape: this.conTraslape,
          });
        } catch (error) {
          this.error = error.response?.data?.error || "Error en el procesamiento.";
          this.loading = false;
        }
      },
      updateCanvas(regionesCount) {
  const canvas = this.$refs.canvas;
  const context = canvas.getContext("2d");
  
  // Ajusta el tamaño del canvas según el número de regiones
  canvas.width = Math.max(400, regionesCount * 40); // Ajustar según sea necesario
  canvas.height = 200;

  context.clearRect(0, 0, canvas.width, canvas.height);

  const barWidth = canvas.width / regionesCount; // Ajusta según el número de regiones
  const heightFactor = canvas.height / Math.max(1, Math.max(...this.regiones)); // Evita división por cero

  for (let i = 0; i < regionesCount; i++) {
    context.fillStyle = "blue";
    context.fillRect(i * barWidth, canvas.height - (this.regiones[i] * heightFactor), barWidth - 1, this.regiones[i] * heightFactor); // Dibujar la barra
  }
},
    },
  };
  </script>
  
  <style>
  #app {
    max-width: 600px;
    margin: 0 auto;
    text-align: center;
  }
  </style>
  