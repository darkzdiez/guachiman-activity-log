<script setup>
import { ref, onMounted, reactive } from 'vue'
const props = defineProps({
    log_name: {
        type: [String, Number],
        required: true
    },
    log_ref: {
        type: [String, Number],
        required: true
    }
})

const timeline = reactive([])

const loadTimeline = () => {
    let url = new URL(
        $globalState.getBackendBaseUrl() +
            '/api/guachiman/activity-log/timeline/' +
            props.log_name +
            '/' +
            props.log_ref
    )
    httpRequest({
        url: url,
        method: 'GET',
        errors: []
    })
        .then((data) => {
            timeline.push(...data.activities)
        })
        .catch((response) => {
            console.error(response)
        })
}

onMounted(() => {
    loadTimeline()
})

const changesFor = (line) => {
    const changes = line && line.properties && Array.isArray(line.properties.changes)
        ? line.properties.changes
        : []
    return changes
}

const isRelationDiff = (change) => {
    if (!change) return false
    const hasAdded = change.added && (Array.isArray(change.added.ids) || Array.isArray(change.added.labels))
    const hasRemoved = change.removed && (Array.isArray(change.removed.ids) || Array.isArray(change.removed.labels))
    const hasLabelArrays = Array.isArray(change.old_labels) || Array.isArray(change.new_labels)
    const hasArrayValues = Array.isArray(change.old_value) || Array.isArray(change.new_value)
    return !!(hasAdded || hasRemoved || hasLabelArrays || hasArrayValues)
}

const joinOrDash = (arr) => {
    if (Array.isArray(arr) && arr.length) return arr.join(', ')
    return '—'
}

const prettyValue = (v) => {
    if (v === null || v === undefined || v === '') return 'Nulo'
    if (Array.isArray(v)) return v.length ? v.join(', ') : '—'
    return String(v)
}
</script>

<template>
    <div
        class="timeline"
        v-if="timeline.length"
    >
        <template v-for="(line, index) in timeline">
            <div class="timeline__line">
                <div
                    class="timeline__icon"
                    :class="{
                        'timeline__icon--create': line.event === 'create',
                        'timeline__icon--update': line.event === 'update'
                    }"
                >
                    <i :class="line.event === 'create' ? 'fas fa-plus' : 'fas fa-pencil-alt'"></i>
                </div>
                <div class="timeline__content">
                    <div v-if="line.event === 'create'">
                        <div class="timeline__title">Registro Creado</div>
                        <div class="timeline__description">
                            {{ line.created_at_formatted }} por {{ line.causer.fullname }}
                        </div>
                    </div>
                    <div v-else>
                        <div class="timeline__title">Actualización</div>
                        <template v-for="(change, cidx) in changesFor(line)" :key="cidx">
                            <div class="timeline__description" v-if="isRelationDiff(change)">
                                <strong>{{ change.label || change.field }}</strong>
                                <div>• <strong>Nuevos:</strong> <span>{{ joinOrDash(change.added?.labels || change.added?.ids) }}</span></div>
                                <div>• <strong>Quitados:</strong> <span>{{ joinOrDash(change.removed?.labels || change.removed?.ids) }}</span></div>
                                <div>• <strong>Antes:</strong> <span>{{ joinOrDash(change.old_labels || change.old_value) }}</span></div>
                                <div>• <strong>Ahora:</strong> <span>{{ joinOrDash(change.new_labels || change.new_value) }}</span></div>
                            </div>
                            <div class="timeline__description" v-else>
                                <strong>{{ change.label || change.field }}</strong> de
                                <strong>"{{ prettyValue(change.old_value) }}"</strong> a
                                <strong>"{{ prettyValue(change.new_value) }}"</strong>
                            </div>
                        </template>
                        <div class="timeline__description">
                            {{ line.created_at_formatted }} por {{ line.causer.fullname }}
                        </div>
                    </div>
                </div>
            </div>
        </template>
    </div>
    <div
        v-else
        class="no-activity"
    >
        - Aún no hay actividad -
    </div>
</template>

<style lang="scss" scoped>
.timeline {
    display: flex;
    flex-direction: column;
    position: relative;
    margin-left: 20px;

    &::before {
        content: '';
        position: absolute;
        left: -20px;
        top: 10px;
        bottom: 10px;
        width: 2px;
        background-color: #e0e0e0;
    }

    &__line {
        display: flex;
        align-items: flex-start;
        margin-bottom: 20px;
        position: relative;
    }

    &__icon {
        position: absolute;
        left: -31px;
        top: 0;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background-color: #4caf50;
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        border: 2px solid white;
        // z-index: 1;

        &.timeline__icon--create {
            background-color: #4caf50; // Green for create
        }
        &.timeline__icon--update {
            background-color: #ffc107; // Yellow for update
        }
    }

    &__line:last-child {
        margin-bottom: 0;
    }

    &__content {
        background-color: #f9f9f9;
        padding: 15px;
        border-radius: 8px;
        width: 100%;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    }

    &__title {
        font-weight: 600;
        font-size: 0.875rem;
        color: #333;
        margin-bottom: 5px;
    }

    &__description {
        font-size: 0.7rem;
        color: #666;
        line-height: 1.5;

        strong {
            color: #333;
        }

        span {
            font-weight: 500;
        }
    }
}

.no-activity {
    color: #757575;
    font-style: italic;
}
</style>
