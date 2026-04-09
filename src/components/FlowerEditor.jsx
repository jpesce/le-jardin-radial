import { useState } from 'react';
import { CircleAlert } from 'lucide-react';
import { useI18n } from '../i18n/I18nContext.jsx';
import Button from './Button.jsx';
import MonthGrid from './MonthGrid.jsx';
import { parseMonths } from '../data/months.js';
import './FlowerEditor.css';

const DEFAULT_MONTHS = new Array(12).fill('dormant');

function compactMonths(states) {
  const result = {};
  let i = 0;
  while (i < 12) {
    const state = states[i];
    let end = i;
    while (end + 1 < 12 && states[end + 1] === state) end++;
    const key = i === end ? `${i + 1}` : `${i + 1}-${end + 1}`;
    result[key] = state;
    i = end + 1;
  }
  return result;
}

export default function FlowerEditor({ flower, onSave, onCancel, onDelete }) {
  const { t } = useI18n();

  const [nameEn, setNameEn] = useState(flower?.names?.en ?? '');
  const [nameFr, setNameFr] = useState(flower?.names?.fr ?? '');
  const [scientificName, setScientificName] = useState(
    flower?.scientificName ?? '',
  );
  const [bloomColor, setBloomColor] = useState(
    flower?.colors?.blooming ?? '#E84393',
  );
  const [monthStates, setMonthStates] = useState(
    flower?.monthStates ??
      (flower?.months ? parseMonths(flower.months) : [...DEFAULT_MONTHS]),
  );
  const [attempted, setAttempted] = useState(false);

  const missingNameEn = nameEn.trim().length === 0;
  const missingNameFr = nameFr.trim().length === 0;
  const invalidColor = !/^#[0-9a-fA-F]{6}$/.test(bloomColor);
  const noBlooming = !monthStates.includes('blooming');
  const isValid =
    !missingNameEn && !missingNameFr && !invalidColor && !noBlooming;

  const handleSubmit = (e) => {
    e.preventDefault();
    setAttempted(true);
    if (!isValid) return;
    onSave({
      names: { en: nameEn.trim(), fr: nameFr.trim() },
      scientificName: scientificName.trim(),
      colors: { blooming: bloomColor },
      months: compactMonths(monthStates),
    });
  };

  return (
    <form className="flower-editor" onSubmit={handleSubmit}>
      <button className="catalog-back" onClick={onCancel} type="button">
        ← {t('cancel')}
      </button>

      <label className="editor-label">
        {t('flowerNameEn')}
        <input
          type="text"
          className="panel-input editor-input"
          value={nameEn}
          onChange={(e) => setNameEn(e.target.value)}
          autoFocus
        />
      </label>

      <label className="editor-label">
        {t('flowerNameFr')}
        <input
          type="text"
          className="panel-input editor-input"
          value={nameFr}
          onChange={(e) => setNameFr(e.target.value)}
        />
      </label>

      <label className="editor-label">
        {t('scientificName')}
        <input
          type="text"
          className="panel-input editor-input"
          value={scientificName}
          onChange={(e) => setScientificName(e.target.value)}
        />
      </label>

      <label className="editor-label">
        {t('bloomColor')}
        <div className="editor-color-row">
          <input
            type="color"
            className="editor-color-picker"
            value={bloomColor}
            onChange={(e) => setBloomColor(e.target.value)}
          />
          <input
            type="text"
            className="panel-input editor-color-hex"
            value={bloomColor}
            onChange={(e) => setBloomColor(e.target.value)}
            maxLength={7}
          />
        </div>
      </label>

      <div className="editor-label">
        {t('monthSchedule')}
        <MonthGrid
          value={monthStates}
          onChange={setMonthStates}
          bloomColor={bloomColor}
        />
      </div>

      <div className="editor-actions">
        <Button variant="outline" size="md" onClick={onCancel} type="button">
          {t('cancel')}
        </Button>
        <Button variant="solid" size="md" type="submit">
          {t('save')}
        </Button>
      </div>
      {attempted && !isValid && (
        <p className="editor-hint">
          <CircleAlert size={12} />
          {missingNameEn || missingNameFr
            ? t('validationName')
            : invalidColor
              ? t('validationColor')
              : noBlooming
                ? t('validationBlooming')
                : ''}
        </p>
      )}
      {onDelete && (
        <Button
          variant="ghost"
          size="sm"
          color="danger"
          className="editor-delete-btn"
          onClick={onDelete}
          type="button"
        >
          {t('deleteFlower')}
        </Button>
      )}
    </form>
  );
}
