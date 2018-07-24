const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const INITIAL_STATE = {count: 0}
const INTERVAL_INPUT = 'intervalInput'
const TEXT_INPUT = 'textInput'
const COMBINED_INPUT = 'combinedInput'
const Observable = Rx.Observable;
//DOM elems
const result = $('#result');
const startBtn = $('#start');
const positiveBtn = $('#positive');
const negativeBtn = $('#negative');
const stopBtn = $('#stop');
const halfBtn = $('#half');
const quarterBtn = $('#quarter');
const resetBtn = $('#reset');
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//click streams
const startBtn$ = Observable.fromEvent(startBtn, 'click')
const positiveBtn$ = Observable.fromEvent(positiveBtn, 'click')
const negativeBtn$ = Observable.fromEvent(negativeBtn, 'click')
const stopBtn$ = Observable.fromEvent(stopBtn, 'click')
const halfBtn$ = Observable.fromEvent(halfBtn, 'click')
const quarterBtn$ = Observable.fromEvent(quarterBtn, 'click')
const resetBtn$ = Observable.fromEvent(resetBtn, 'click')
const intervalCheckBox$ = Observable.fromEvent($('#intervalInput'), 'change')
const textCheckBox$ = Observable.fromEvent($('#textInput'), 'change')
const combinedCheckBox$ = Observable.fromEvent($('#combinedInput'), 'change')

const toggleInputActivity = DOMElem => bool => {
    console.log(DOMElem.disabled)
    DOMElem.disabled = bool;
}
const radioButtons$ = Observable.merge(
    intervalCheckBox$.pluck('target', 'value'),
    textCheckBox$.pluck('target', 'value'),
    combinedCheckBox$.pluck('target', 'value')
).startWith(INTERVAL_INPUT)

const input$ = Observable.fromEvent($('#input'), 'input').pluck('target', 'value').startWith('enter text')

//reducers
const incR = ({ count }) => ({ count: count + 1 })
const decR = ({ count }) => ({ count: count - 1 })
const resetR = ({ count }) => ({ count: 0 })

const launchers$ = Observable.merge(
    startBtn$.mapTo(1000),
    halfBtn$.mapTo(500),
    quarterBtn$.mapTo(250)
)

const algebricStrategy$ = Observable.merge(
    positiveBtn$.mapTo(incR),
    negativeBtn$.mapTo(decR)
).startWith(incR)

const intervalActions = ({ time, reducer }) => Observable.merge(
    Observable.interval(time).takeUntil(stopBtn$).mapTo(reducer),
    resetBtn$.mapTo(resetR)
)
const reducer = (state, action) => action(state)
const intervalLogic$ = Observable.combineLatest(
    launchers$,
    algebricStrategy$,
    (time, reducer) => ({ time, reducer })
)
    .switchMap(intervalActions)
    .startWith(INITIAL_STATE)
    .scan(reducer)
    .pluck('count')

    const guessNumber$ = Observable.combineLatest(
        intervalLogic$,
        input$.startWith('')
    )
    .map(([a,b]) => ({count: a, text:b}))
    .filter(({count, text}) => count === parseInt(text));
const start$ = radioButtons$.switchMap(inputType => {
    switch(inputType) {
        case INTERVAL_INPUT: {
            toggleInputActivity($('#input'))(true)
            return intervalLogic$
            break;
        }
        case TEXT_INPUT: {
            toggleInputActivity($('#input'))(false)
            return input$
            break;
        }
        case COMBINED_INPUT: {
            toggleInputActivity($('#input'))(false)
            return  guessNumber$.do(console.log)
            break;
        }
    }
})
    

const renderer = (DOMElem => (txt) => {
    DOMElem.innerHTML = txt;
})($('#result'));
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// entry point
const main = (async () => {
    start$.subscribe(renderer)
    
})();

const promises = [
    Promise.resolve(1),
    Promise.resolve(2),
    Promise.resolve(3),
    Promise.resolve(4),
    Promise.resolve(5),
]
const test = Observable.of(null).mergeMap( () => Promise.all(promises), 1)
test.subscribe(console.log);