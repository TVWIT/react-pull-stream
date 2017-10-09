var test = require('tape');
var S = require('pull-stream');
var React = require('react');
var ReactDom = require('react-dom');
var toStream = require('../');

test('duplex stream from react component', function (t) {
    var i = 0;
    t.plan(10);

    function Elmt (props) {
        if (props.count <= 3) {
            process.nextTick(function () {
                t.equal(props.count, i, 'should subscibe to events');
                props.push(++i);
            });
        } else {
            process.nextTick(function () {
                viewStream.abort();
            });
        }
        return null;
    }

    Elmt.defaultProps = {
        count: 0
    };

    var viewStream = toStream(Elmt, function onEnd (err) {
        t.pass('should callback on end');
    })

    var j = 1;
    S(
        viewStream.source.listen(),
        S.through(function (n) {
            t.equal(n, j++);
        }),
        S.collect(function (err, res) {
            t.pass('subscriber should end');
        })
    )

    S(
        viewStream,
        S.map(function (n) {
            return { count: n };
        }),
        viewStream
    );

    var el = document.createElement('div');
    document.body.appendChild(el);
    ReactDom.render(React.createElement(viewStream.view), el);
});
