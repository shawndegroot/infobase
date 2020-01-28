import './RadioButtons.scss';
import classNames from 'classnames';

export const RadioButtons = ({ options, onChange }) => <div className="radio-buttons">
  {/* display = text, id = state, active = selected or not */}
  {options.map( ({ display, id, active })=> 
    <button 
      key={id}
      aria-pressed={active}
      className={classNames("btn","radio-buttons__option", active && "radio-buttons__option--active")}
      onClick={()=>{ onChange(id);}}
    >
      {display}
    </button>
  )}
</div>;