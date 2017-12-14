require('./style.scss')

module.exports = {
  onCreate (input) {
    this.state = input
  },

  onInput (input) {
    this.state.selected = input.selected
  },

  handleClick () {
    this.setState('selected', true)
  }
}
