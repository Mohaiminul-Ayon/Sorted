import React, { useState } from 'react';
import { transition } from './model.js';

export default function TaskForm({ task, projects, meetings, save, remove, split, draft = false, creating = false }) {
  const [title, setTitle] = useState(task.title);
  const [state, setState] = useState(creating ? '' : task.state);
  const [start, setStart] = useState(task.start || task.suggestedStart || '');
  const [duration, setDuration] = useState(task.duration || 30);
  const [energy, setEnergy] = useState(task.energy || 'Medium');
  const [priority, setPriority] = useState(task.priority || 'Normal');
  const [note, setNote] = useState(task.note || '');
  const [project, setProject] = useState(task.project || '');
  const [meeting, setMeeting] = useState(task.meeting || '');
  const [context, setContext] = useState(task.originalText || '');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [confirm, setConfirm] = useState(false);
  const [splitting, setSplitting] = useState(false);
  const [splitText, setSplitText] = useState(task.title);
  const scheduled = state === 'Schedule now';
  const date = start.split('T')[0] || '';
  const time = start.split('T')[1] || '';
  return <form className="task-editor" onSubmit={e => {
    e.preventDefault();
    try {
      const linked = meetings.find(m => m.id === meeting);
      const fields = { title: title.trim(), start: scheduled ? start : '', duration: Number(duration), energy, priority, note,
        project: linked?.project || project, meeting: meeting || null, reason, originalText: context, contextSaved: Boolean(context) };
      transition(task, state, fields);
      save(state, fields);
    } catch (err) { setError(err.message); }
  }}>
    <label>Task title<input required maxLength={500} value={title} onChange={e => setTitle(e.target.value)} placeholder="What needs to be done?" /></label>
    <div className="form-row">
      <label>Task type<select required value={state} onChange={e => setState(e.target.value)}>
        {creating && <option value="" disabled>Choose a type</option>}
        {['Inbox', 'Schedule now', 'Important', 'Someday', ...(!creating ? ['Done'] : [])].map(s => <option key={s}>{s}</option>)}
      </select></label>
      <label>Priority<select required value={priority} onChange={e => setPriority(e.target.value)}>{['High', 'Medium', 'Normal'].map(p => <option key={p}>{p}</option>)}</select></label>
    </div>
    <div className={`editor-schedule ${scheduled ? '' : 'unscheduled'}`}>
      <div className="form-row">
        <label>Date<input required={scheduled} disabled={!scheduled} type="date" value={date} onChange={e => setStart(`${e.target.value}T${time}`)} /></label>
        <label>Time<input required={scheduled} disabled={!scheduled} type="time" value={time} onChange={e => setStart(`${date}T${e.target.value}`)} /></label>
      </div>
      <div className="form-row">
        <label>Duration · minutes<input required={scheduled} type="number" min="1" max="1440" value={duration} onChange={e => setDuration(e.target.value)} /></label>
        <label>Focus needed<select value={energy} onChange={e => setEnergy(e.target.value)}>{['High', 'Medium', 'Low'].map(s => <option key={s}>{s}</option>)}</select></label>
      </div>
      {!scheduled && <p className="helper">Choose Schedule now to set a date and time.</p>}
    </div>
    <label>Context · optional<textarea rows={3} maxLength={4000} value={context} onChange={e => setContext(e.target.value)} placeholder="Client instructions, background, or the original message" /></label>
    <div className="form-row">
      <label>Project · optional<select value={project} onChange={e => setProject(e.target.value)}><option value="">No project</option>{projects.map(p => <option key={p.id}>{p.name}</option>)}</select></label>
      <label>Meeting · optional<select value={meeting} onChange={e => { setMeeting(e.target.value); const linked = meetings.find(m => m.id === e.target.value); if (linked?.project) setProject(linked.project); }}><option value="">No meeting</option>{meetings.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}</select></label>
    </div>
    <label>Preparation note · optional<input value={note} onChange={e => setNote(e.target.value)} placeholder="Anything to have ready" /></label>
    {!creating && task.state === 'Schedule now' && <label>Reason for changing the plan · optional<input value={reason} onChange={e => setReason(e.target.value)} /></label>}
    {error && <p role="alert" className="form-error">{error}</p>}
    <button className="primary" disabled={!title.trim() || !state}>{creating ? 'Create task' : draft ? 'Update task' : 'Save changes'}</button>
    {!creating && <>
      {task.reschedules.length > 0 && <details><summary>Reschedule history · {task.reschedules.length}</summary>{task.reschedules.map((r, i) => <p key={i}>{r.reason} · {new Date(r.time).toLocaleDateString()}</p>)}</details>}
      {task.state === 'Inbox' && <><button type="button" className="text-button" onClick={() => setSplitting(!splitting)}>Split into smaller tasks</button>{splitting && <div className="context-box"><label>One task per line<textarea rows={3} value={splitText} onChange={e => setSplitText(e.target.value)} /></label><button type="button" className="secondary" disabled={splitText.split('\n').filter(t => t.trim()).length < 2} onClick={() => split(splitText.split('\n').map(t => t.trim()).filter(Boolean), context)}>Split tasks</button></div>}</>}
      <button className="text-button muted" type="button" onClick={() => setConfirm(true)}>{draft ? 'Remove this suggestion' : 'Let this task go'}</button>
      {confirm && <div className="confirm-box"><p>{draft ? 'Remove this task from the proposal?' : 'Let this task go? It remains in your JSON export.'}</p><button type="button" className="secondary" onClick={remove}>Yes, remove it</button><button type="button" className="text-button" onClick={() => setConfirm(false)}>Keep it</button></div>}
    </>}
  </form>;
}
