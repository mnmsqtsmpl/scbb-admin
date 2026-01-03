<template>
  <el-dialog title="Сменить пароль" v-model:visible="localVisible" width="420px">
    <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
      <el-form-item label="Старый пароль" prop="oldPassword">
        <el-input v-model="form.oldPassword" type="password" autocomplete="current-password" />
      </el-form-item>

      <el-form-item label="Новый пароль" prop="newPassword">
        <el-input v-model="form.newPassword" type="password" autocomplete="new-password" />
      </el-form-item>

      <el-form-item label="Повторите новый пароль" prop="confirmPassword">
        <el-input v-model="form.confirmPassword" type="password" />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="close">Отмена</el-button>
      <el-button type="primary" :loading="loading" @click="onSubmit">Сменить пароль</el-button>
    </template>
  </el-dialog>
</template>

<script>
import { ref, reactive, watch } from 'vue'
import { useAuthStore } from '../stores/auth'
import { ElMessage } from 'element-plus'

export default {
  name: 'ChangePasswordModal',
  props: { visible: { type: Boolean, default: false } },
  emits: ['update:visible', 'changed'],
  setup(props, { emit }) {
    const auth = useAuthStore()
    const formRef = ref(null)
    const loading = ref(false)

    const localVisible = ref(props.visible)
    watch(() => props.visible, (v) => (localVisible.value = v))
    watch(localVisible, (v) => emit('update:visible', v))

    const form = reactive({ oldPassword: '', newPassword: '', confirmPassword: '' })

    const rules = {
      oldPassword: [{ required: true, message: 'Введите старый пароль', trigger: 'blur' }],
      newPassword: [{ required: true, message: 'Введите новый пароль', trigger: 'blur' }],
      confirmPassword: [
        { required: true, message: 'Подтвердите новый пароль', trigger: 'blur' },
        { validator: (rule, value) => value === form.newPassword, message: 'Пароли не совпадают', trigger: 'blur' },
      ],
    }

    function close() {
      localVisible.value = false
    }

    async function onSubmit() {
      formRef.value.validate(async (valid) => {
        if (!valid) return
        loading.value = true
        try {
          await auth.changePassword(form.oldPassword, form.newPassword)
          ElMessage.success('Пароль успешно изменён')
          localVisible.value = false
          emit('changed')
          form.oldPassword = ''
          form.newPassword = ''
          form.confirmPassword = ''
        } catch (err) {
          console.error(err)
          ElMessage.error(err?.message || 'Ошибка при смене пароля')
        } finally {
          loading.value = false
        }
      })
    }

    watch(() => props.visible, (v) => {
      if (!v) {
        // reset form when closed
        form.oldPassword = ''
        form.newPassword = ''
        form.confirmPassword = ''
        if (formRef.value) formRef.value.clearValidate()
      }
    })

    return { form, rules, formRef, onSubmit, close, loading, localVisible }
  },
}
</script>

<style scoped>
.el-dialog {
  font-family: inherit;
}
</style>