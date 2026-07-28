---
layout: false
---

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vitepress'

const { go } = useRouter()

onMounted(() => {
	go('/pdf-lab/fontkit/introduction/what-is-fontkit')
})
</script>

Redirecting you to the Fontkit documentation... If you are not redirected
automatically, [open the Fontkit
documentation](/pdf-lab/fontkit/introduction/what-is-fontkit).
