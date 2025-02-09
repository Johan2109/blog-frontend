<template>
  <div>
    <h1 class="text-3xl font-bold mb-6 text-center">Blog</h1>
    <div v-if="loading" class="text-center text-gray-500">Cargando...</div>
    <div v-else-if="error" class="text-center text-red-500">{{ error }}</div>
    <div v-else>
      <div
        v-for="post in posts"
        :key="post.id"
        class="bg-white p-6 rounded shadow-md mb-6"
      >
        <h2 class="text-2xl font-semibold">{{ post.title }}</h2>
        <p class="text-gray-700">{{ post.body }}</p>
        <img
          class="mt-4 w-full h-48 object-cover rounded"
          src="./../assets/logo.png"
          alt="Imagen del post"
        />

        <!-- Subida de archivo -->
        <input
          type="file"
          @change="onFileChange($event, post.id)"
          accept="image/*,application/pdf"
          class="mt-4"
        />
        <p v-if="files[post.id]" class="text-sm text-gray-600 mt-2">
          Archivo seleccionado: {{ files[post.id].name }}
        </p>

        <!-- Vista previa de archivo -->
        <div v-if="files[post.id] && filePreviews[post.id]" class="mt-2">
          <img
            v-if="files[post.id].type.startsWith('image/')"
            :src="filePreviews[post.id]"
            class="w-32 h-32 object-cover rounded"
          />
          <iframe
            v-else-if="files[post.id].type === 'application/pdf'"
            :src="filePreviews[post.id]"
            class="w-full h-64 border rounded"
          ></iframe>
        </div>

        <!-- Comentarios -->
        <div v-if="comments[post.id]" class="mt-4">
          <h3 class="text-lg font-semibold">Comentarios</h3>
          <ul class="list-disc list-inside text-gray-600">
            <li v-for="comment in comments[post.id]" :key="comment.id">
              {{ comment.body }}
            </li>
          </ul>
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
