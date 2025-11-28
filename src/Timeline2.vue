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
            timeline.splice(0, timeline.length)
            timeline.push(...data.activities)
        })
        .catch((response) => {
            console.error(response)
        })
}

onMounted(() => {
    loadTimeline()
})

defineExpose({ loadTimeline })

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
    <div class="timeline-minimal" v-if="timeline.length">
        <div 
            v-for="(line, index) in timeline" 
            :key="index" 
            class="timeline-item"
        >
            <div 
                class="timeline-dot" 
                :class="{ 'timeline-dot--active': index === 0 }"
            ></div>
            
            <div class="timeline-content">
                <!-- Title -->
                <div class="timeline-title">
                    <span v-if="line.event === 'create'">Nuevo registro</span>
                    <span v-else-if="line.event === 'update'">Actualización</span>
                    <span v-else>{{ line.event }}</span>
                </div>
                
                <!-- Description -->
                <div class="timeline-desc">
                    <span v-if="line.event === 'create'">
                        Se creó el registro
                    </span>
                    <span v-else-if="line.event === 'update'">
                        <template v-for="(change, cidx) in changesFor(line)" :key="cidx">
                            <span v-if="cidx > 0">, </span>
                            <span v-if="isRelationDiff(change)">
                                {{ change.label || change.field }} ({{ joinOrDash(change.new_labels || change.new_value) }})
                            </span>
                            <span v-else>
                                Se modificó {{ change.label || change.field }}
                            </span>
                        </template>
                    </span>
                    <span v-else>
                        {{ line.description }}
                    </span>
                    
                    <span class="timeline-meta">
                         - {{ line.created_at_formatted }} - {{ line.causer?.fullname }}
                    </span>
                </div>
            </div>
        </div>
    </div>
    <div v-else class="no-activity">
        - Aún no hay actividad -
    </div>
</template>

<style lang="scss" scoped>
.timeline-minimal {
    position: relative;
    padding-left: 20px;
    margin-left: 10px;
    border-left: 2px solid #e0e0e0;
    padding-top: 5px;
    padding-bottom: 5px;
}

.timeline-item {
    position: relative;
    margin-bottom: 25px;
    
    &:last-child {
        margin-bottom: 0;
    }
}

.timeline-dot {
    position: absolute;
    left: -27px; /* Centered on the 2px border relative to 20px padding */
    top: 4px;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background-color: #e0e0e0;
    border: 2px solid #fff; 
    box-sizing: border-box;

    &--active {
        background-color: #666;
        border-color: #fff;
    }
}

.timeline-content {
    display: flex;
    flex-direction: column;
}

.timeline-title {
    font-weight: 600;
    font-size: 0.95rem;
    color: #333;
    margin-bottom: 2px;
}

.timeline-desc {
    font-size: 0.85rem;
    color: #666;
    line-height: 1.4;
}

.timeline-meta {
    color: #888;
}

.no-activity {
    color: #757575;
    font-style: italic;
    margin-left: 20px;
}
</style>
