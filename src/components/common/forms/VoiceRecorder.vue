<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import WaveSurfer from 'wavesurfer.js';
import RecordPlugin from 'wavesurfer.js/dist/plugins/record.esm.js';
import ButtonWithIcon from '@/components/common/buttons/ButtonWithIcon.vue';

const props = withDefaults(
  defineProps<{
    modelValue?: Blob | File | string | null;
    /** When set (e.g. from i18n), overrides default Arabic copy */
    title?: string;
    hintAttachNotes?: string;
    hintRecordPrompt?: string;
    recordingInProgress?: string;
  }>(),
  {
    modelValue: null,
    title: 'رسالة صوتية',
    hintAttachNotes: 'هل تود إرفاق بعض الملاحظات',
    hintRecordPrompt: 'قم بتسجيل رسالتك الصوتية إلى',
    recordingInProgress: 'جاري التسجيل...',
  }
);

const emit = defineEmits(['update:modelValue']);

const ALLOWED_AUDIO_MIME_TYPES = [
    'audio/mpeg',
    'audio/mp3',
    'audio/wav',
    'audio/x-wav',
    'audio/wave',
    'audio/aac',
    'audio/m4a',
    'audio/mp4',
    'audio/ogg',
];

const mimeTypeToExtension = (mime?: string) => {
    if (!mime) return null;
    const normalized = mime.toLowerCase();
    if (normalized.includes('mpeg') || normalized.includes('mp3')) return 'mp3';
    if (normalized.includes('wav')) return 'wav';
    if (normalized.includes('aac')) return 'aac';
    if (normalized.includes('m4a') || normalized.includes('mp4')) return 'm4a';
    if (normalized.includes('ogg')) return 'ogg';
    return null;
};

const isAllowedMimeType = (mime?: string) => {
    if (!mime) return false;
    const normalized = mime.toLowerCase();
    return ALLOWED_AUDIO_MIME_TYPES.some((type) => normalized.includes(type));
};

const interleaveAudioChannels = (audioBuffer: AudioBuffer) => {
    const numChannels = audioBuffer.numberOfChannels;
    const length = audioBuffer.length;
    const result = new Float32Array(length * numChannels);
    const channelData: Float32Array[] = [];
    for (let channel = 0; channel < numChannels; channel++) {
        channelData.push(audioBuffer.getChannelData(channel));
    }

    let offset = 0;
    for (let i = 0; i < length; i++) {
        for (let channel = 0; channel < numChannels; channel++) {
            result[offset++] = channelData[channel][i];
        }
    }
    return result;
};

const audioBufferToWav = (audioBuffer: AudioBuffer): ArrayBuffer => {
    const numChannels = audioBuffer.numberOfChannels;
    const sampleRate = audioBuffer.sampleRate;
    const bytesPerSample = 2; // 16-bit PCM
    const interleaved = interleaveAudioChannels(audioBuffer);
    const buffer = new ArrayBuffer(44 + interleaved.length * bytesPerSample);
    const view = new DataView(buffer);

    const writeString = (offset: number, str: string) => {
        for (let i = 0; i < str.length; i++) {
            view.setUint8(offset + i, str.charCodeAt(i));
        }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + interleaved.length * bytesPerSample, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true); // PCM chunk size
    view.setUint16(20, 1, true); // audio format PCM
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numChannels * bytesPerSample, true);
    view.setUint16(32, numChannels * bytesPerSample, true);
    view.setUint16(34, 8 * bytesPerSample, true);
    writeString(36, 'data');
    view.setUint32(40, interleaved.length * bytesPerSample, true);

    let offset = 44;
    for (let i = 0; i < interleaved.length; i++, offset += 2) {
        const sample = Math.max(-1, Math.min(1, interleaved[i]));
        view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
    }

    return buffer;
};

const convertBlobToWav = async (blob: Blob): Promise<File> => {
    const arrayBuffer = await blob.arrayBuffer();
    const audioContext = new AudioContext();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    const wavBuffer = audioBufferToWav(audioBuffer);
    await audioContext.close();
    return new File([wavBuffer], 'voice-recording.wav', { type: 'audio/wav' });
};

const ensureAllowedAudioFile = async (blob: Blob): Promise<File> => {
    if (isAllowedMimeType(blob.type)) {
        const extension = mimeTypeToExtension(blob.type) || 'ogg';
        return new File([blob], `voice-recording.${extension}` , { type: blob.type });
    }

    try {
        return await convertBlobToWav(blob);
    } catch (error) {
        console.error('Failed to convert audio blob to WAV:', error);
        const extension = mimeTypeToExtension(blob.type) || 'ogg';
        return new File([blob], `voice-recording.${extension}`, { type: blob.type || 'audio/ogg' });
    }
};

const getSupportedMimeType = () => {
    const mediaRecorder = window.MediaRecorder;
    if (mediaRecorder && typeof mediaRecorder.isTypeSupported === 'function') {
        const preferredTypes = [
            'audio/ogg;codecs=opus',
            'audio/webm;codecs=opus',
            'audio/webm',
        ];
        for (const type of preferredTypes) {
            if (MediaRecorder.isTypeSupported(type)) {
                return type;
            }
        }
    }
    return undefined;
};

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
    record.value.on('record-end', async (blob: Blob) => {
        const file = await ensureAllowedAudioFile(blob);
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
            initPlayer(file);
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

// For URL-based audio, we'll use a simple audio element to avoid CORS
const audioElement = ref<HTMLAudioElement | null>(null);
const isLoadedFromUrl = ref(false);

const initPlayerFromUrl = (url: string) => {
    // Clean up any existing wavesurfer instance
    if (wavesurfer.value) {
        wavesurfer.value.destroy();
        wavesurfer.value = null;
    }
    
    // Create audio element for URL playback
    if (!audioElement.value) {
        audioElement.value = new Audio();
        
        audioElement.value.addEventListener('loadedmetadata', () => {
            const totalSeconds = audioElement.value?.duration || 0;
            duration.value = formatTime(totalSeconds);
        });
        
        audioElement.value.addEventListener('timeupdate', () => {
            const currentSeconds = audioElement.value?.currentTime || 0;
            currentTime.value = formatTime(currentSeconds);
        });
        
        audioElement.value.addEventListener('ended', () => {
            isPlaying.value = false;
            if (audioElement.value) {
                audioElement.value.currentTime = 0;
            }
        });
        
        audioElement.value.addEventListener('error', (error) => {
            console.error('Error loading audio from URL:', error);
        });
    }
    
    audioElement.value.src = url;
    isLoadedFromUrl.value = true;
};

const startRecording = async () => {
    await initRecorder();
    
    if (record.value) {
        const mimeType = getSupportedMimeType();
        await record.value.startRecording(mimeType ? { mimeType } : undefined);
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
    if (isLoadedFromUrl.value && audioElement.value) {
        if (isPlaying.value) {
            audioElement.value.pause();
            isPlaying.value = false;
        } else {
            audioElement.value.play();
            isPlaying.value = true;
        }
    } else if (wavesurfer.value) {
        wavesurfer.value.playPause();
        isPlaying.value = !isPlaying.value;
    }
};

const deleteRecording = () => {
    if (wavesurfer.value) {
        wavesurfer.value.destroy();
        wavesurfer.value = null;
    }
    if (audioElement.value) {
        audioElement.value.pause();
        audioElement.value.src = '';
    }
    isLoadedFromUrl.value = false;
    emit('update:modelValue', null);
    recordingSeconds = 0;
    recordingTimer.value = '00:00';
    currentTime.value = '00:00';
    duration.value = '00:00';
    isPlaying.value = false;
    isRecording.value = false;
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
    if (props.modelValue) {
        // If it's a string URL, load directly
        if (typeof props.modelValue === 'string') {
            setTimeout(() => initPlayerFromUrl(props.modelValue as string), 100);
        } else if (props.modelValue instanceof File || props.modelValue instanceof Blob) {
            setTimeout(() => initPlayer(props.modelValue as File), 100);
        }
    }
});

onBeforeUnmount(() => {
    if (wavesurfer.value) {
        wavesurfer.value.destroy();
    }
    if (audioElement.value) {
        audioElement.value.pause();
        audioElement.value.src = '';
    }
    clearInterval(timerInterval);
});

// Watch for external changes to modelValue (e.g. if cleared or loaded)
watch(() => props.modelValue, async (newVal, oldVal) => {
    if (!newVal) {
        if (wavesurfer.value) {
            wavesurfer.value.destroy();
            wavesurfer.value = null;
        }
        if (audioElement.value) {
            audioElement.value.pause();
            audioElement.value.src = '';
        }
        isLoadedFromUrl.value = false;
        return;
    }
    
    // If new value is loaded and different from old value, initialize player
    if (newVal && newVal !== oldVal) {
        // Destroy existing player if any
        if (wavesurfer.value) {
            wavesurfer.value.destroy();
            wavesurfer.value = null;
        }
        if (audioElement.value) {
            audioElement.value.pause();
            audioElement.value.src = '';
        }
        isLoadedFromUrl.value = false;
        
        // If it's a string URL, use audio element
        if (typeof newVal === 'string') {
            initPlayerFromUrl(newVal);
        } else if (newVal instanceof File || newVal instanceof Blob) {
            setTimeout(() => initPlayer(newVal as Blob), 100);
        }
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
      <p class="text-primary-600 font-bold text-sm mb-2">{{ props.title }}</p>
      <p class="text-gray-400 font-medium text-sm">{{ props.hintAttachNotes }}</p>
      <p class="text-blue-900 font-medium text-sm">{{ props.hintRecordPrompt }}</p>
    </div>

    <!-- Recording State: Timer & Visualizer Placehoder -->
    <div v-else-if="isRecording" class="flex-1 flex items-center gap-4">
        <div class="text-error-600 font-bold animate-pulse">
            {{ props.recordingInProgress }} {{ recordingTimer }}
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

        <!-- Waveform Container (only for recorded blobs) or Simple Progress Bar (for URLs) -->
        <div v-if="!isLoadedFromUrl" ref="containerRef" class="flex-1 h-[40px]"></div>
        <div v-else class="flex-1 flex items-center gap-2">
            <div class="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div class="h-full bg-primary-500 transition-all duration-100" 
                     :style="{ width: audioElement && audioElement.duration ? `${(audioElement.currentTime / audioElement.duration) * 100}%` : '0%' }">
                </div>
            </div>
        </div>

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
