<script setup lang="ts">
import { useLedgerApi, ApiError } from '~/composables/useLedgerApi'
import { useToken } from '~/composables/useToken'

type Mode = 'choose' | 'paste' | 'created'

const api = useLedgerApi()
const { setToken } = useToken()

const mode = ref<Mode>('choose')
const pastedToken = ref('')
const error = ref('')
const busy = ref(false)
const newAccount = ref<{ id: string; token: string } | null>(null)
const copied = ref(false)

async function handleCreate() {
  error.value = ''
  busy.value = true
  try {
    const res = await api.createAccount()
    newAccount.value = { id: res.id, token: res.token }
    mode.value = 'created'
  } catch (e) {
    error.value = (e as Error).message || 'Không tạo được account.'
  } finally {
    busy.value = false
  }
}

async function handlePaste() {
  error.value = ''
  const candidate = pastedToken.value.trim()
  if (!candidate) {
    error.value = 'Hãy dán token trước khi tiếp tục.'
    return
  }
  busy.value = true
  try {
    // Temporarily set token, then verify via /me — clearToken happens automatically on 401.
    setToken(candidate)
    await api.me()
    // Token verified — useToken state is already set.
  } catch (e) {
    setToken(null)
    if (e instanceof ApiError && e.status === 401) {
      error.value = 'Token không hợp lệ.'
    } else {
      error.value = (e as Error).message || 'Không xác thực được token.'
    }
  } finally {
    busy.value = false
  }
}

async function confirmCreated() {
  if (!newAccount.value) return
  setToken(newAccount.value.token)
  // Pages will render automatically once token is set.
}

async function copyToken() {
  if (!newAccount.value) return
  try {
    await navigator.clipboard.writeText(newAccount.value.token)
    copied.value = true
    setTimeout(() => (copied.value = false), 1800)
  } catch {
    // Ignore — user can still copy manually.
  }
}
</script>

<template>
  <main class="relative z-10 min-h-screen flex items-center justify-center p-6">
    <div class="card card-glow w-full max-w-xl p-8 sm:p-10">
      <div class="flex items-center gap-3 mb-6">
        <div class="w-2 h-2 rounded-full bg-[var(--color-cyan)] pulse-rune shadow-[0_0_12px_var(--color-cyan)]" />
        <span class="label text-[var(--color-cyan)]">Auth · Token Mode</span>
      </div>

      <h1 class="text-3xl sm:text-4xl font-bold mb-2">
        <span class="text-[var(--color-cyan)]">Ledger</span>
        <span class="text-[var(--color-fg-muted)]">.kynguyen.cc</span>
      </h1>
      <p class="text-sm text-[var(--color-fg-muted)] mb-8">
        Một token duy nhất là toàn bộ tài khoản của anh. Mất token là mất dữ liệu — không có cách reset.
      </p>

      <!-- choose -->
      <div v-if="mode === 'choose'" class="space-y-3">
        <button class="btn-primary w-full py-3 px-5 rounded-lg" :disabled="busy" @click="handleCreate">
          {{ busy ? 'Đang khởi tạo…' : '⊕ Tạo account mới' }}
        </button>
        <button class="btn-ghost w-full py-3 px-5 rounded-lg" :disabled="busy" @click="mode = 'paste'">
          ⋯ Đã có token, đăng nhập
        </button>
      </div>

      <!-- paste existing -->
      <div v-else-if="mode === 'paste'" class="space-y-4">
        <label class="block">
          <span class="label block mb-2">Dán token</span>
          <input
            v-model="pastedToken"
            type="text"
            spellcheck="false"
            autocomplete="off"
            class="input-field w-full px-4 py-3 rounded-lg text-sm"
            placeholder="Token URL-safe, dài ~43 ký tự"
            @keyup.enter="handlePaste"
          />
        </label>
        <p v-if="error" class="text-xs text-[var(--color-rose)] font-mono">{{ error }}</p>
        <div class="flex gap-3">
          <button class="btn-ghost flex-1 py-2.5 px-4 rounded-lg text-sm" :disabled="busy" @click="mode = 'choose'; error = ''">
            ← Quay lại
          </button>
          <button class="btn-primary flex-1 py-2.5 px-4 rounded-lg text-sm" :disabled="busy" @click="handlePaste">
            {{ busy ? 'Đang xác thực…' : 'Vào app →' }}
          </button>
        </div>
      </div>

      <!-- newly created -->
      <div v-else-if="mode === 'created' && newAccount" class="space-y-4">
        <div class="border border-[var(--color-gold)] rounded-lg p-4 bg-[rgba(240,180,41,0.08)]">
          <p class="text-xs text-[var(--color-gold)] font-mono tracking-wider mb-1">⚠ HIỂN THỊ MỘT LẦN</p>
          <p class="text-xs text-[var(--color-fg-muted)]">
            Token này chỉ xuất hiện ngay bây giờ. Hãy lưu vào nơi an toàn (1Password, Bitwarden, Apple Keychain…). Server chỉ giữ hash SHA-256.
          </p>
        </div>

        <div>
          <span class="label block mb-2">Token</span>
          <div class="flex items-stretch gap-2">
            <code class="flex-1 input-field px-4 py-3 rounded-lg text-xs break-all select-all">{{ newAccount.token }}</code>
            <button class="btn-ghost px-4 rounded-lg text-xs" @click="copyToken">
              {{ copied ? '✓' : 'Copy' }}
            </button>
          </div>
        </div>

        <button class="btn-primary w-full py-3 px-5 rounded-lg" @click="confirmCreated">
          Đã lưu, vào app →
        </button>
      </div>

      <p v-if="error && mode === 'choose'" class="mt-4 text-xs text-[var(--color-rose)] font-mono">{{ error }}</p>
    </div>
  </main>
</template>
