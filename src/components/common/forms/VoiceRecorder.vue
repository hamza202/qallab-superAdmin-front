<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import WaveSurfer from 'wavesurfer.js';
import RecordPlugin from 'wavesurfer.js/dist/plugins/record.esm.js';
import ButtonWithIcon from '@/components/common/buttons/ButtonWithIcon.vue';

const props = defineProps({
  modelValue: {
    type: [Blob, File, null],
    default: null
  }
});

const emit = defineEmits(['update:modelValue']);

const containerRef = ref<HTMLElement | null>(null);
const wavesurfer = ref<WaveSurfer | null>(null);
const record = ref<any>(null);

const isRecording = ref(false);
const isPlaying = ref(false);
const currentTime = ref('00:00');
const duration = ref('00:00');
const recordingTimer = ref('00:00');
let timerInterval: any = null;
let recordingSeconds = 0;

// Initialize Recorder (Hidden)
const initRecorder = async () => {
    // Destroy existing instance if any
    if (wavesurfer.value) {
        wavesurfer.value.destroy();
        wavesurfer.value = null;
    }

    // Create a hidden container for the recorder instance
    const hiddenContainer = document.createElement('div');
    hiddenContainer.style.display = 'none';
    document.body.appendChild(hiddenContainer);

    wavesurfer.value = WaveSurfer.create({
        container: hiddenContainer,
        height: 0,
        waveColor: 'transparent',
    });

    // Register Record Plugin
    record.value = wavesurfer.value.registerPlugin(RecordPlugin.create());

    // Handle recording end
    record.value.on('record-end', (blob: Blob) => {
        const file = new File([blob], 'voice-recording.webm', { type: 'audio/webm' });
        emit('update:modelValue', file);
        
        // Clean up recorder instance
        if (wavesurfer.value) {
            wavesurfer.value.destroy();
            wavesurfer.value = null;
        }
        if (hiddenContainer.parentNode) {
            hiddenContainer.parentNode.removeChild(hiddenContainer);
        }

        // Initialize Player with the recorded blob next tick (once UI calls v-else)
        setTimeout(() => {
            initPlayer(blob);
        }, 100);
    });
};

// Initialize Player (Visible)
const initPlayer = (blob: Blob) => {
    if (!containerRef.value) return;

    if (wavesurfer.value) {
        wavesurfer.value.destroy();
    }

    wavesurfer.value = WaveSurfer.create({
        container: containerRef.value,
        waveColor: '#D1E9FF',
        progressColor: '#1570EF',
        cursorColor: '#1849A9',
        barWidth: 2,
        barGap: 3,
        barRadius: 3,
        height: 40,
    });

    wavesurfer.value.on('ready', () => {
        const totalSeconds = wavesurfer.value?.getDuration() || 0;
        duration.value = formatTime(totalSeconds);
    });

    wavesurfer.value.on('audioprocess', () => {
        const currentSeconds = wavesurfer.value?.getCurrentTime() || 0;
        currentTime.value = formatTime(currentSeconds);
    });

    wavesurfer.value.on('finish', () => {
        isPlaying.value = false;
        wavesurfer.value?.stop();
    });

    wavesurfer.value.loadBlob(blob);
};

const startRecording = async () => {
    await initRecorder();
    
    if (record.value) {
        await record.value.startRecording();
        isRecording.value = true;
        startTimer();
    }
};

const stopRecording = () => {
    if (record.value && isRecording.value) {
        record.value.stopRecording();
        isRecording.value = false;
        stopTimer();
    }
};

const playPause = () => {
    if (wavesurfer.value) {
        wavesurfer.value.playPause();
        isPlaying.value = !isPlaying.value;
    }
};

const deleteRecording = () => {
    if (wavesurfer.value) {
        wavesurfer.value.destroy();
        wavesurfer.value = null;
    }
    emit('update:modelValue', null);
    recordingSeconds = 0;
    recordingTimer.value = '00:00';
    currentTime.value = '00:00';
    duration.value = '00:00';
    isPlaying.value = false;
};


const startTimer = () => {
    recordingSeconds = 0;
    recordingTimer.value = '00:00';
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        recordingSeconds++;
        recordingTimer.value = formatTime(recordingSeconds);
    }, 1000);
};

const stopTimer = () => {
    clearInterval(timerInterval);
};

const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

// Handle existing file on mount (if any)
onMounted(() => {
    if (props.modelValue && props.modelValue instanceof File) {
        // initPlayer(props.modelValue); // Can't init immediately as ref might not be ready or v-if issue?
        // Actually if modelValue exists, v-else is rendered, so containerRef exists.
        setTimeout(() => initPlayer(props.modelValue as File), 100);
    }
});

onBeforeUnmount(() => {
    if (wavesurfer.value) {
        wavesurfer.value.destroy();
    }
    clearInterval(timerInterval);
});

// Watch for external changes to modelValue (e.g. if cleared)
watch(() => props.modelValue, (newVal) => {
    if (!newVal && wavesurfer.value) {
        wavesurfer.value.empty();
    }
});


// Icons
const microphoneIcon = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M19 10V12C19 15.866 15.866 19 12 19M5 10V12C5 15.866 8.13401 19 12 19M12 19V22M8 22H16M12 15C10.3431 15 9 13.6569 9 13V5C9 3.34315 10.3431 2 12 2C13.6569 2 15 3.34315 15 5V12C15 13.6569 13.6569 15 12 15Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const stopIcon = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect x="6" y="6" width="12" height="12" rx="2" fill="white" />
</svg>`;

const playIcon = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M5 3V21L19 12L5 3Z" fill="#1570EF"/>
</svg>`;

const pauseIcon = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M6 19H10V5H6V19ZM14 5V19H18V5H14Z" fill="#1570EF"/>
</svg>`;

const trashIcon = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M3 6H5H21" stroke="#F04438" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M8 6V4C8 3.46957 8.21071 3 8.58579 2.62513C8.96086 2.25 9.43043 2.03906 10 2.03906H14C14.5696 2.03906 15.0391 2.25 15.4142 2.62513C15.7893 3 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21 18.4142 21.3749C18.0391 21.7498 17.5696 21.9608 17 21.9608H7C6.43043 21.9608 5.96086 21.7498 5.58579 21.3749C5.21071 21 5 20.5304 5 20V6H19Z" stroke="#F04438" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

</script>

<template>
  <div class="rounded-lg bg-white px-3 py-3 mb-3 flex items-center justify-between min-h-[80px]">
    
    <!-- Initial State: Text -->
    <div v-if="!isRecording && !modelValue" class="flex-1">
      <p class="text-primary-600 font-bold text-sm mb-2">رسالة صوتية</p>
      <p class="text-gray-400 font-medium text-sm">هل تود إرفاق بعض الملاحظات</p>
      <p class="text-blue-900 font-medium text-sm">قم بتسجيل رسالتك الصوتية إلى</p>
    </div>

    <!-- Recording State: Timer & Visualizer Placehoder -->
    <div v-else-if="isRecording" class="flex-1 flex items-center gap-4">
        <div class="text-error-600 font-bold animate-pulse">
            جاري التسجيل... {{ recordingTimer }}
        </div>
        <!-- Waveform container will be used for visualization if configured, but here we keep it for playback later. 
             If we want live visualization, we need to connect it. Record plugin does not auto-visualize in the same container easily without config.
             For simplicity, we show text/timer during recording and waveform after. -->
    </div>

    <!-- Recorded State: Player Info -->
    <div v-else class="flex-1 flex items-center gap-3">
        <!-- Play/Pause Button -->
        <button @click="playPause" class="p-2 rounded-full bg-primary-50 hover:bg-primary-100 transition-colors">
            <span v-if="!isPlaying" v-html="playIcon"></span>
            <span v-else v-html="pauseIcon"></span>
        </button>

        <!-- Waveform Container -->
        <div ref="containerRef" class="flex-1 h-[40px]"></div>

        <!-- Duration -->
        <span class="text-xs text-gray-500 font-mono">{{ isPlaying ? currentTime : duration }}</span>
    </div>

    <!-- Actions -->
    <div class="flex items-center gap-2">
        <!-- Start Recording Button -->
        <ButtonWithIcon 
            v-if="!isRecording && !modelValue"
            color="primary-500" 
            iconOnly 
            :icon="microphoneIcon" 
            height="70" 
            width="50"
            variant="flat"
            class="!text-white rounded-md" 
            @click="startRecording"
        />

        <!-- Stop Recording Button -->
        <ButtonWithIcon 
            v-if="isRecording"
            color="error-500" 
            iconOnly 
            :icon="stopIcon" 
            height="70"
            width="50" 
            variant="flat"
            class="!text-white rounded-md animate-pulse bg-error-500" 
            @click="stopRecording"
        />

        <!-- Delete Recording Button -->
        <button 
            v-if="!isRecording && modelValue"
            @click="deleteRecording"
            class="p-2 rounded-full hover:bg-error-50 transition-colors ms-2"
        >
            <span v-html="trashIcon"></span>
        </button>
    </div>
  </div>
</template>

<style scoped>
/* Ensure the waveform container has width */
</style>
