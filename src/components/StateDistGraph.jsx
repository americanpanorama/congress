import * as React from 'react';
import ReactDOM from 'react-dom';
import * as d3 from 'd3';

import DimensionsStore from '../stores/DimensionsStore';
import { getColorForParty } from '../utils/HelperFunctions';

export default class StateDistGraph extends React.Component {

  constructor (props) { 
    super(props); 

    this.state ={
      x: this.props.x,
      yDem: this.props.yDem,
      heightDem: this.props.heightDem,
      yRep: this.props.yRep,
      heightRep: this.props.heightRep,
      yThird: this.props.yThird,
      heightThird: this.props.heightThird,
      yPluralityLabel: (this.props.demStrength > 0) ? this.props.yDem - 7 : this.props.yRep + this.props.heightRep + 19,
    };
  }

  componentWillReceiveProps(nextProps) {
    const staggerMultiplier = 5;
    if (this.props.x !== nextProps.x) {
      d3.select(ReactDOM.findDOMNode(this))
        .transition()
        .delay(nextProps.x * staggerMultiplier)
        .duration(1000)
        .attr('transform', 'translate(' + (nextProps.x + 42) +' 0)')
        .on('end', () => {
          this.setState({
            y: nextProps.x
          });
        });
    }

    if (this.props.yDem !== nextProps.yDem || this.props.heightDem !== nextProps.heightDem) {
      d3.select(this.refs.demBar)
        .transition()
        .delay(nextProps.x * staggerMultiplier)
        .duration(1000)
        .attr('y', nextProps.yDem)
        .attr('height', nextProps.heightDem)
        .on('end', () => {
          this.setState({
            yDem: nextProps.yDem,
            heightDem: nextProps.heightDem
          });
        });
    }

    if (this.props.yRep !== nextProps.yRep || this.props.heightRep !== nextProps.heightRep) {
      d3.select(this.refs.RepBar)
        .transition()
        .delay(nextProps.x * staggerMultiplier)
        .duration(1000)
        .attr('y', nextProps.yRep)
        .attr('height', nextProps.heightRep)
        .on('end', () => {
          this.setState({
            yRep: nextProps.yRep,
            heightRep: nextProps.heightRep
          });
        });
    }

    if (this.props.yThird !== nextProps.yThird || this.props.heightThird !== nextProps.heightThird) {
      d3.select(this.refs.ThirdBar)
        .transition()
        .delay(nextProps.x * staggerMultiplier)
        .duration(1000)
        .attr('y', nextProps.yThird)
        .attr('height', nextProps.heightThird)
        .on('end', () => {
          this.setState({
            yThird: nextProps.yThird,
            heightThird: nextProps.heightThird
          });
        });
    }

    if ((this.props.demStrength > 0 || this.props.demStrength < 0) && (nextProps.demStrength > 0 || nextProps.demStrength < 0)) {
      d3.select(this.refs.pluralityLabel)
        .transition()
        .delay(nextProps.x * staggerMultiplier)
        .duration(1000)
        .attr('y', (nextProps.demStrength > 0) ? nextProps.yDem - 7 : nextProps.yRep + nextProps.heightRep + 19)
        .attr('height', nextProps.heightThird)
        .on('end', () => {
          this.setState({
            yPluralityLabel: (nextProps.demStrength > 0) ? nextProps.yDem - 7 : nextProps.yRep + nextProps.heightRep + 19
          });
        });
    }
  }

  render() {
    return (
      <g 
        //onMouseEnter={ (this.props.the_geojson) ? this.props.onProjectInspected : null }
        //onMouseLeave={ (this.props.the_geojson) ? this.props.onProjectOut : null }
        //onClick={ this.props.onProjectSelected }
        id={ this.props.state  }
        transform={'translate(' + (this.state.x + 42) +' 0)'}
      >
        { (this.props.demStrength > 0 || this.props.demStrength < 0) ?
          <text
            x={7}
            y={ this.state.yPluralityLabel }
            textAnchor='middle'
            style={{ fontSize: '12px' }}
            ref='pluralityLabel'
          >
            { '+' + Math.abs(this.props.demStrength) }
          </text> : ''
        }

        <rect
          x={0}
          y={this.state.yDem}
          height={ this.state.heightDem }
          width={14}
          fill={getColorForParty('democrat')}
          ref='demBar'
          //className={ 'poc' + ((this.props.inspectedProject && this.props.inspectedProject != this.props.project_id) ? ' notInspected' : '') }
        />
        <rect
          x={0}
          y={this.state.yThird}
          height={ this.state.heightThird }
          width={14}
          fill={getColorForParty('')}
          ref='thirdBar'
          //className={ 'poc' + ((this.props.inspectedProject && this.props.inspectedProject != this.props.project_id) ? ' notInspected' : '') }
        />
        <rect
          x={0}
          y={this.state.yRep}
          height={ this.state.heightRep }
          width={14}
          fill={getColorForParty('republican')}
          ref='repBar'
          //className={ 'poc' + ((this.props.inspectedProject && this.props.inspectedProject != this.props.project_id) ? ' notInspected' : '') }
        />
      </g>
    );
  }

}