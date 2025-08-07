import Timeline from './Timeline.vue'
import ShowModal from './ModalShow.vue'
import GuachimanActivityLogTimeline from './Timeline.vue'

const showModalActivityLogTimeline = (logName, logRef) => {
    let modalClient = awesomeModal.open({
        type: 'component',
        component: ShowModal,
        log_name: logName,
        log_ref: logRef
    })
    modalClient.promise.then((response) => {})
    modalClient.promise.catch((response) => {})
}

export { showModalActivityLogTimeline, Timeline, ShowModal, GuachimanActivityLogTimeline }
