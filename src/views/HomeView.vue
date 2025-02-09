<template>
  <div>
    <h1
      class="text-4xl font-extrabold text-center text-gray-800 bg-gradient-to-r from-cyan-500 to-emerald-500 text-transparent bg-clip-text p-4"
    >
      Blog de Pruebas Front-End
    </h1>
    <div v-if="loading" class="text-center text-gray-500">Cargando...</div>
    <div v-else-if="error" class="text-center text-red-500">{{ error }}</div>
    <div v-else>
      <div
        v-for="post in posts"
        :key="post.id"
        class="bg-white p-6 rounded shadow-md mb-6"
      >
        <div class="bg-white p-6 rounded-lg shadow-md">
          <!-- Título del Post -->
          <h2 class="text-3xl font-bold text-gray-900 mb-3">
            {{ post.title }}
          </h2>

          <!-- Imagen del Post -->
          <div class="w-full flex justify-center mb-4">
            <img
              src="./../assets/logo.png"
              alt="Imagen del post"
              class="w-full max-w-2xl h-64 object-cover rounded-lg shadow-md"
            />
          </div>

          <!-- Cuerpo del Post -->
          <p class="text-lg text-gray-700 leading-relaxed">
            {{ post.body }}
          </p>
        </div>

        <!-- Subida de archivo -->
        <div class="flex justify-center mt-4">
          <label
            class="cursor-pointer bg-blue-500 text-white py-2 px-4 rounded-lg shadow-md hover:bg-blue-600 transition duration-300 inline-block"
          >
            Seleccionar archivo
            <input
              type="file"
              @change="onFileChange($event, post.id)"
              accept="image/*,application/pdf"
              class="hidden"
            />
          </label>
        </div>
        <div
          v-if="files[post.id]"
          class="mt-2 flex items-center bg-gray-100 p-3 rounded-lg shadow-sm"
        >
          <svg
            class="w-6 h-6 text-blue-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15.172 7l-6.586 6.586a2 2 0 01-2.828 0l-2-2A2 2 0 014.414 9l4.586-4.586a2 2 0 012.828 0L15.172 7M19 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2V9a2 2 0 012-2h4"
            ></path>
          </svg>
          <span class="ml-2 text-gray-700 font-medium truncate">
            {{ files[post.id].name }}
          </span>
        </div>

        <!-- Vista previa de archivo -->
        <div v-if="files[post.id] && filePreviews[post.id]" class="mt-2">
          <div
            v-if="files[post.id].type.startsWith('image/')"
            class="flex justify-center mt-2"
          >
            <img
              :src="filePreviews[post.id]"
              class="w-40 h-40 object-cover rounded-lg shadow-md"
            />
          </div>
          <div
            v-else-if="files[post.id].type === 'application/pdf'"
            class="flex justify-center mt-4"
          >
            <iframe
              :src="filePreviews[post.id]"
              class="w-full max-w-3xl h-[500px] border rounded-lg shadow-md"
            ></iframe>
          </div>
        </div>

        <!-- Comentarios -->
        <div
          v-if="comments[post.id]"
          class="mt-6 bg-white p-4 rounded-lg shadow-md"
        >
          <h3 class="text-xl font-bold text-gray-800 border-b pb-2 mb-4">
            💬 Comentarios
          </h3>
          <div
            v-for="comment in comments[post.id]"
            :key="comment.id"
            class="mb-3 p-3 bg-gray-100 rounded-lg shadow-sm"
          >
            <p class="text-gray-700">{{ comment.body }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import Swal from "sweetalert2";

export default {
  data() {
    return {
      posts: [],
      comments: {},
      loading: true,
      error: null,
      files: {},
      filePreviews: {},
    };
  },
  async mounted() {
    try {
      const response = await axios.get(
        "https://jsonplaceholder.typicode.com/posts"
      );
      this.posts = response.data;
      await this.fetchComments();
    } catch (error) {
      this.error = "Error al cargar los posts. Intenta nuevamente más tarde.";
      console.error("Error al cargar posts:", error);
    } finally {
      this.loading = false;
    }
  },
  methods: {
    async fetchComments() {
      try {
        const commentsRequests = this.posts.map((post) =>
          axios
            .get(
              `https://jsonplaceholder.typicode.com/posts/${post.id}/comments`
            )
            .then((response) => ({ postId: post.id, comments: response.data }))
        );
        const commentsResults = await Promise.all(commentsRequests);
        commentsResults.forEach(({ postId, comments }) => {
          this.comments[postId] = comments;
        });
      } catch (error) {
        console.error("Error al cargar comentarios:", error);
      }
    },
    onFileChange(event, postId) {
      const file = event.target.files[0];
      if (!file || file.size > 5 * 1024 * 1024) {
        Swal.fire({
          icon: "error",
          title: "Archivo no válido",
          text: "El archivo debe ser menor a 5MB.",
        });
        return;
      }
      this.files[postId] = file;
      const reader = new FileReader();
      reader.onload = (e) => {
        this.filePreviews[postId] = e.target.result;
      };
      reader.readAsDataURL(file);
    },
  },
};
</script>

<style>
body {
  @apply bg-gray-100;
}
</style>
