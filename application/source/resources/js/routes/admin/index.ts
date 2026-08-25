import classroom from './classroom'
import sessions from './sessions'
import members from './members'

const admin = {
    classroom: Object.assign(classroom, classroom),
    sessions: Object.assign(sessions, sessions),
    members: Object.assign(members, members),
}

export default admin