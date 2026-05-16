<script setup lang="ts">
import { ApiError, TOKEN_LENGTH, TOKEN_PATTERN, useLedgerApi } from '~/composables/useLedgerApi'
import { useToken } from '~/composables/useToken'

type Mode = 'choose' | 'create' | 'login'

const api = useLedgerApi()
const { setToken } = useToken()

const mode = ref<Mode>('choose')
const input = ref('')
const error = ref('')
const busy = ref(false)

function go(next: Mode) {
  mode.value = next
  input.value = ''
  error.value = ''
}

const isValid = computed(() => TOKEN_PATTERN.test(input.value))
const remaining = computed(() => Math.max(0, TOKEN_LENGTH - input.value.length))

async function handleCreate() {
  if (!isValid.value) {
    error.value = `Token phải đúng ${TOKEN_LENGTH} ký tự, chỉ chữ và số.`
    return
  }
  busy.value = true
  error.value = ''
  try {
    await api.createAccount(input.value)
    setToken(input.value)
  } catch (e) {
    if (e instanceof ApiError && e.status === 409) {
      error.value = 'Token này đã có người dùng. Hãy chọn token khác.'
    } else {
      error.value = (e as Error).message || 'Không tạo được account.'
    }
  } finally {
    busy.value = false
  }
}

async function handleLogin() {
  if (!isValid.value) {
    error.value = `Token phải đúng ${TOKEN_LENGTH} ký tự, chỉ chữ và số.`
    return
  }
  busy.value = true
  error.value = ''
  try {
    setToken(input.value)
    await api.me()
  } catch (e) {
    setToken(null)
    if (e instanceof ApiError && e.status === 401) {
      error.value = 'Token không tồn tại. Anh nhập lại hoặc chuyển sang "Tạo account".'
    } else {
      error.value = (e as Error).message || 'Không xác thực được token.'
    }
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <main class="min-h-screen flex items-center justify-center p-4 md:p-6">
    <div class="w-full max-w-md card p-6 md:p-8">
      <div class="flex items-center gap-2 mb-6">
        <span class="w-2 h-2 rounded-full bg-[var(--color-accent)]" />
        <span class="label">Ledger</span>
      </div>

      <h1 class="text-2xl font-semibold mb-2">Ghi sổ thu chi</h1>
      <p class="text-sm text-[var(--color-text-muted)] mb-7 leading-relaxed">
        Một token {{ TOKEN_LENGTH }} ký tự (chữ + số) là toàn bộ tài khoản. Tự đặt, tự nhớ — mất là mất, không reset được.
      </p>

      <!-- choose -->
      <div v-if="mode === 'choose'" class="space-y-2">
        <button class="btn btn-primary w-full !py-3 text-base font-semibold" @click="go('create')">
          Tạo account mới
        </button>
        <button class="btn btn-ghost w-full !py-3 text-base" @click="go('login')">
          Đã có token, đăng nhập
        </button>
      </div>

      <!-- create new -->
      <form v-else-if="mode === 'create'" class="space-y-3" @submit.prevent="handleCreate">
        <div>
          <label class="label block mb-1.5">Chọn token mới · {{ TOKEN_LENGTH }} ký tự</label>
          <input
            v-model="input"
            type="text"
            spellcheck="false"
            autocomplete="off"
            autocapitalize="off"
            :maxlength="TOKEN_LENGTH"
            class="input text-lg tracking-wider"
            placeholder="VD: NguyenA123"
          />
          <p class="mt-1.5 text-xs"
             :class="isValid ? 'text-[var(--color-income)]' : 'text-[var(--color-text-dim)]'">
            {{ isValid ? '✓ hợp lệ' : remaining > 0 ? `còn ${remaining} ký tự` : 'chỉ dùng A–Z, a–z, 0–9' }}
          </p>
        </div>

        <div class="bg-[var(--color-surface-2)] border border-[var(--color-warning)]/30 rounded-md p-3">
          <div class="text-xs font-medium text-[var(--color-warning)] mb-1">Không reset được</div>
          <div class="text-xs text-[var(--color-text-muted)] leading-relaxed">
            Server chỉ lưu hash SHA-256, không lưu raw token. Hãy ghi vào nơi an toàn.
          </div>
        </div>

        <p v-if="error" class="text-xs text-[var(--color-expense)]">{{ error }}</p>

        <div class="flex gap-2 pt-2">
          <button type="button" class="btn btn-ghost flex-1" :disabled="busy" @click="go('choose')">Quay lại</button>
          <button type="submit" class="btn btn-primary flex-1" :disabled="busy || !isValid">
            {{ busy ? 'Đang tạo…' : 'Tạo & vào' }}
          </button>
        </div>
      </form>

      <!-- login existing -->
      <form v-else-if="mode === 'login'" class="space-y-3" @submit.prevent="handleLogin">
        <div>
          <label class="label block mb-1.5">Nhập token · {{ TOKEN_LENGTH }} ký tự</label>
          <input
            v-model="input"
            type="text"
            spellcheck="false"
            autocomplete="off"
            autocapitalize="off"
            :maxlength="TOKEN_LENGTH"
            class="input text-lg tracking-wider"
            placeholder="Token đã có"
          />
          <p class="mt-1.5 text-xs text-[var(--color-text-dim)]">
            {{ remaining > 0 ? `còn ${remaining} ký tự` : 'sẵn sàng' }}
          </p>
        </div>

        <p v-if="error" class="text-xs text-[var(--color-expense)]">{{ error }}</p>

        <div class="flex gap-2 pt-2">
          <button type="button" class="btn btn-ghost flex-1" :disabled="busy" @click="go('choose')">Quay lại</button>
          <button type="submit" class="btn btn-primary flex-1" :disabled="busy || !isValid">
            {{ busy ? 'Đang xác thực…' : 'Vào app' }}
          </button>
        </div>
      </form>
    </div>
  </main>
</template>
