import DashboardController from './DashboardController'
import LearningSessionController from './LearningSessionController'
import LearningResourceController from './LearningResourceController'
import SessionQnaController from './SessionQnaController'
import AdminLearningSessionController from './AdminLearningSessionController'
import AdminMemberController from './AdminMemberController'
import Settings from './Settings'

const Controllers = {
    DashboardController: Object.assign(DashboardController, DashboardController),
    LearningSessionController: Object.assign(LearningSessionController, LearningSessionController),
    LearningResourceController: Object.assign(LearningResourceController, LearningResourceController),
    SessionQnaController: Object.assign(SessionQnaController, SessionQnaController),
    AdminLearningSessionController: Object.assign(AdminLearningSessionController, AdminLearningSessionController),
    AdminMemberController: Object.assign(AdminMemberController, AdminMemberController),
    Settings: Object.assign(Settings, Settings),
}

export default Controllers