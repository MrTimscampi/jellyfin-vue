<template>
  <div>
    <audio-player
      v-if="isPlaying && getCurrentlyPlayingMediaType === 'Audio'"
      class="d-none"
    />
    <player-dialog
      v-if="isPlaying && getCurrentlyPlayingMediaType === 'Video'"
      dark
      persistent
      hide-overlay
      no-click-animation
      scrollable
      :fullscreen="!isMinimized"
      :retain-focus="!isMinimized"
      :content-class="getContentClass()"
      :width="$vuetify.breakpoint.mobile ? '60vw' : '25vw'"
      :value="isPlaying"
    >
      <v-hover v-slot="{ hover }">
        <v-card class="player-card" width="100%">
          <video-player />
          <!-- Mini Player Overlay -->
          <v-fade-transition>
            <v-overlay v-show="hover && isMinimized" absolute>
              <div class="d-flex flex-column player-overlay">
                <div class="d-flex flex-row">
                  <v-btn icon @click="toggleMinimized">
                    <v-icon>mdi-arrow-expand-all</v-icon>
                  </v-btn>
                  <v-spacer />
                  <v-btn icon @click="stopPlayback">
                    <v-icon>mdi-close</v-icon>
                  </v-btn>
                </div>
                <div
                  class="absolute d-flex flex-row justify-center align-center"
                >
                  <v-btn
                    class="all-pointer-events"
                    icon
                    large
                    @click="setPreviousTrack"
                  >
                    <v-icon size="32">mdi-skip-previous</v-icon>
                  </v-btn>
                  <v-btn
                    class="all-pointer-events"
                    icon
                    x-large
                    @click="togglePause"
                  >
                    <v-icon size="48">
                      {{ isPaused ? 'mdi-play' : 'mdi-pause' }}
                    </v-icon>
                  </v-btn>
                  <v-btn
                    class="all-pointer-events"
                    icon
                    large
                    @click="setNextTrack"
                  >
                    <v-icon size="32">mdi-skip-next</v-icon>
                  </v-btn>
                </div>
              </div>
            </v-overlay>
          </v-fade-transition>
          <!-- Full Screen OSD -->
          <v-fade-transition>
            <v-overlay v-show="!isMinimized && hover" absolute>
              <div
                class="d-flex flex-column justify-space-between align-center player-overlay"
              >
                <div class="osd-top">
                  <div class="d-flex justify-space-between align-center">
                    <div class="d-flex">
                      <v-btn icon @click="stopPlayback">
                        <v-icon>mdi-close</v-icon>
                      </v-btn>
                      <v-btn icon @click="toggleMinimized">
                        <v-icon> mdi-chevron-down </v-icon>
                      </v-btn>
                      <v-btn
                        v-if="supportedFeatures.pictureInPicture"
                        icon
                        disabled
                      >
                        <v-icon> mdi-picture-in-picture-bottom-right </v-icon>
                      </v-btn>
                    </div>
                    <p class="ma-0 text-center">{{ currentItemName }}</p>
                    <div class="d-flex">
                      <v-btn icon disabled>
                        <v-icon> mdi-autorenew </v-icon>
                      </v-btn>
                      <v-btn v-if="supportedFeatures.airplay" icon disabled>
                        <v-icon> mdi-apple-airplay </v-icon>
                      </v-btn>
                      <v-btn icon disabled>
                        <v-icon> mdi-cast </v-icon>
                      </v-btn>
                    </div>
                  </div>
                </div>

                <div class="px-4 osd-bottom">
                  <div>
                    <v-slider
                      min="0"
                      :max="runtime"
                      validate-on-blur
                      :step="0"
                      :value="sliderValue"
                      hide-details
                      thumb-label
                      @end="onPositionChange"
                      @change="onPositionChange"
                      @mousedown="onClick"
                      @mouseup="onClick"
                      @input="onInputChange"
                    >
                      <template #prepend>
                        <span class="mt-1">
                          {{ getRuntime(realPosition) }}
                        </span>
                      </template>
                      <template #thumb-label>
                        {{ getRuntime(sliderValue) }}
                      </template>
                      <template #append>
                        <span class="mt-1">
                          {{ getRuntime(runtime) }}
                        </span>
                      </template>
                    </v-slider>
                    <div class="d-flex justify-space-between">
                      <div>
                        <v-btn icon @click="setPreviousTrack">
                          <v-icon> mdi-skip-previous </v-icon>
                        </v-btn>
                        <v-btn icon @click="togglePause">
                          <v-icon>
                            {{ isPaused ? 'mdi-play' : 'mdi-pause' }}
                          </v-icon>
                        </v-btn>
                        <v-btn icon @click="setNextTrack">
                          <v-icon icon> mdi-skip-next </v-icon>
                        </v-btn>
                      </div>
                      <div>
                        <v-btn icon disabled>
                          <v-icon> mdi-closed-caption </v-icon>
                        </v-btn>
                        <v-btn icon disabled>
                          <v-icon> mdi-cog </v-icon>
                        </v-btn>

                        <v-btn icon disabled>
                          <v-icon> mdi-fullscreen </v-icon>
                        </v-btn>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </v-overlay>
          </v-fade-transition>
        </v-card>
      </v-hover>
    </player-dialog>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapActions, mapGetters } from 'vuex';
import timeUtils from '~/mixins/timeUtils';
import { AppState } from '~/store';
import { PlaybackStatus } from '~/store/playbackManager';
import {
  getSupportedFeatures,
  SupportedFeaturesInterface
} from '~/utils/supportedFeatures';

export default Vue.extend({
  mixins: [timeUtils],
  data() {
    return {
      supportedFeatures: {} as SupportedFeaturesInterface,
      clicked: false,
      currentInput: 0
    };
  },
  computed: {
    ...mapGetters('playbackManager', [
      'getCurrentItem',
      'getPreviousItem',
      'getCurrentlyPlayingMediaType',
      'getCurrentlyPlayingType'
    ]),
    isPlaying(): boolean {
      return (
        this.$store.state.playbackManager.status !== PlaybackStatus.stopped
      );
    },
    isPaused(): boolean {
      return this.$store.state.playbackManager.status === PlaybackStatus.paused;
    },
    isMinimized(): boolean {
      return this.$store.state.playbackManager.isMinimized;
    },
    currentPosition(): number {
      return this.$store.state.playbackManager.currentTime;
    },
    runtime(): number {
      return this.ticksToMs(this.getCurrentItem.RunTimeTicks) / 1000;
    },
    currentItemName(): string {
      switch (this.getCurrentItem.Type) {
        case 'Episode':
          return `${this.getCurrentItem.SeriesName} - S${this.getCurrentItem.ParentIndexNumber}E${this.getCurrentItem.IndexNumber} -  ${this.getCurrentItem.Name}`;
        case 'Movie':
        default:
          return this.getCurrentItem.Name;
      }
    },
    sliderValue: {
      get(): number {
        if (!this.clicked) {
          return this.$store.state.playbackManager.currentTime;
        }
        return this.currentInput;
      }
    },
    realPosition: {
      get(): number {
        return this.$store.state.playbackManager.currentTime;
      }
    }
  },
  created() {
    this.supportedFeatures = getSupportedFeatures();

    this.$store.subscribe((mutation, state: AppState) => {
      switch (mutation.type) {
        case 'playbackManager/START_PLAYBACK':
        case 'playbackManager/INCREASE_QUEUE_INDEX':
          // Report playback stop for the previous item
          if (
            state.playbackManager.currentTime !== null &&
            this.getPreviousItem.Id
          ) {
            this.$api.playState.reportPlaybackStopped(
              {
                playbackStopInfo: {
                  ItemId: this.getPreviousItem.Id,
                  PlaySessionId: state.playbackManager.playSessionId,
                  PositionTicks: this.msToTicks(
                    state.playbackManager.currentTime * 1000
                  )
                }
              },
              { progress: false }
            );
          }

          // Then report the start of the next one
          if (this.getCurrentItem.Id !== null) {
            this.$api.playState.reportPlaybackStart(
              {
                playbackStartInfo: {
                  CanSeek: true,
                  ItemId: this.getCurrentItem.Id,
                  PlaySessionId: state.playbackManager.playSessionId,
                  MediaSourceId: state.playbackManager.currentMediaSource?.Id,
                  AudioStreamIndex:
                    state.playbackManager.currentAudioStreamIndex,
                  SubtitleStreamIndex:
                    state.playbackManager.currentSubtitleStreamIndex
                }
              },
              { progress: false }
            );
          }

          this.setLastProgressUpdate({ progress: new Date().getTime() });
          break;
        case 'playbackManager/SET_CURRENT_TIME': {
          const now = new Date().getTime();

          if (
            this.getCurrentItem !== null &&
            now - state.playbackManager.lastProgressUpdate > 1000 &&
            state.playbackManager.currentTime !== null
          ) {
            this.$api.playState.reportPlaybackProgress(
              {
                playbackProgressInfo: {
                  ItemId: this.getCurrentItem.Id,
                  PlaySessionId: state.playbackManager.playSessionId,
                  IsPaused: false,
                  PositionTicks: Math.round(
                    this.msToTicks(state.playbackManager.currentTime * 1000)
                  )
                }
              },
              { progress: false }
            );

            this.setLastProgressUpdate({ progress: new Date().getTime() });
          }
          break;
        }
        case 'playbackManager/STOP_PLAYBACK':
          if (state.playbackManager.currentTime !== null) {
            this.$api.playState.reportPlaybackStopped(
              {
                playbackStopInfo: {
                  ItemId: this.getPreviousItem.Id,
                  PlaySessionId: state.playbackManager.playSessionId,
                  PositionTicks: this.msToTicks(
                    state.playbackManager.currentTime * 1000
                  )
                }
              },
              { progress: false }
            );

            this.setLastProgressUpdate({ progress: 0 });
          }
          break;
        case 'playbackManager/PAUSE_PLAYBACK':
          if (state.playbackManager.currentTime !== null) {
            this.$api.playState.reportPlaybackProgress(
              {
                playbackProgressInfo: {
                  ItemId: this.getCurrentItem.Id,
                  PlaySessionId: state.playbackManager.playSessionId,
                  IsPaused: true,
                  PositionTicks: Math.round(
                    this.msToTicks(state.playbackManager.currentTime * 1000)
                  )
                }
              },
              { progress: false }
            );

            this.setLastProgressUpdate({ progress: new Date().getTime() });
          }
          break;
      }
    });
  },
  methods: {
    ...mapActions('playbackManager', [
      'toggleMinimized',
      'setLastProgressUpdate',
      'resetCurrentItemIndex',
      'setNextTrack',
      'setPreviousTrack',
      'setLastItemIndex',
      'resetLastItemIndex',
      'pause',
      'unpause',
      'changeCurrentTime'
    ]),
    getContentClass(): string {
      return `player ${
        this.isMinimized
          ? 'player--minimized align-self-end'
          : 'player--fullscreen'
      }`;
    },
    stopPlayback(): void {
      this.setLastItemIndex();
      this.resetCurrentItemIndex();
      this.setNextTrack();
    },
    togglePause(): void {
      if (this.isPaused) {
        this.unpause();
      } else {
        this.pause();
      }
    },
    getRuntime(seconds: number): string {
      let minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      minutes = minutes - hours * 60;
      seconds = Math.floor(seconds - (minutes * 60 + hours * 60 * 60));
      /**
       * Formats the second number
       * E.g. 7 -> 07
       *
       * @param {string} seconds Number to format
       * @returns {string} Formatted seconds number
       */
      function formatSeconds(seconds: string): string {
        return ('0' + seconds).slice(-2);
      }

      if (hours)
        return `${hours}:${minutes}:${formatSeconds(seconds.toString())}`;
      return `${minutes}:${formatSeconds(seconds.toString())}`;
    },
    onPositionChange(value: number): void {
      if (!this.clicked) {
        this.changeCurrentTime({ time: value });
      }
    },
    onInputChange(value: number): void {
      this.currentInput = value;
    },
    onClick(): void {
      this.currentInput = this.realPosition;
      this.clicked = !this.clicked;
    }
  }
});
</script>

<style lang="scss">
.absolute {
  pointer-events: none;
  height: 100%;
  width: 100%;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.all-pointer-events {
  pointer-events: all;
}

.v-card.player-card {
  background-color: black !important;
}

.v-overlay .v-overlay__content {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
}

.player-overlay {
  height: 100%;
}

.player--fullscreen {
  position: relative;
  width: 100vw !important;
  height: 100vh !important;
  max-height: 100% !important;
  margin: 0 !important;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
}

.player--minimized {
  justify-self: end !important;
  position: relative;
  margin: 0 !important;
  margin-left: auto !important;
  top: auto;
  left: auto;
  bottom: 2em;
  right: 2em;
}

.osd-top,
.osd-bottom {
  width: 100%;
  padding: 8px;
}

.osd-bottom > div,
.osd-top > div {
  max-width: calc(100vh * 1.77 - 2vh);
  margin: auto;
}

.osd-top {
  padding-bottom: 10em;
  background: linear-gradient(
    180deg,
    rgba(16, 16, 16, 0.75) 0%,
    rgba(16, 16, 16, 0) 100%
  );
}

.osd-bottom {
  padding-top: 10em;
  background: linear-gradient(
    0deg,
    rgba(16, 16, 16, 0.75) 0%,
    rgba(16, 16, 16, 0) 100%
  );
}
</style>