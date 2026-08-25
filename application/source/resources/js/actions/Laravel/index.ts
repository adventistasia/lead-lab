import Fortify from './Fortify'
import Passkeys from './Passkeys'

const Laravel = {
    Fortify: Object.assign(Fortify, Fortify),
    Passkeys: Object.assign(Passkeys, Passkeys),
}

export default Laravel