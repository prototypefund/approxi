import EventEmitter from 'events';
import TDigest from 'tdigest-sd';
import residualSumOfSquares from '../../util/math/residual-sum-of-squares';
import minInsert from '../../util/array/sorted-min-insert';
import aggregatedMean from '../../util/math/aggregated-mean';

const RSS_TOP_MAX_LENGTH = 99;
const PERCENTILE_STEPS = Array.from({ length: 19 }, (v, k) => ++k * 0.05);

export default class SurveysService extends EventEmitter {
  surveysModel;
  statsModel;

  constructor(surveysModel, statsModel) {
    super();
    this.surveysModel = surveysModel;
    this.statsModel = statsModel;
    this.statsModel.subscribe(change => {
      if (!change || !change.new_val || !change.old_val) {
        return;
      }
      this.emit('change:stats', change.new_val);
    });
  }

  async getSurvey(surveyId) {
    return this.surveysModel.get(surveyId);
  }

  async insertSurvey(survey) {
    const id = await this.surveysModel.insert(survey);
    await this.statsModel.insert({ id });
    return id;
  }

  async getStatsForSurvey(surveyId) {
    return this.statsModel.get(surveyId);
  }

  async feedStatsForSurvey(input, survey) {
    if (input.values.length !== survey.values.length) {
      throw new RangeError('Input length mismatch');
    }
    return this.statsModel.update(survey.id, doc => {
      if (!doc.means || !doc.means.length) {
        doc.means = input.values;
      } else {
        doc.means = doc.means.map((m, i) => aggregatedMean(m, doc.count, input.values[i]));
      }
      doc.count++;
      const surveyValues = survey.values.map(({ value }) => value);
      const rss = residualSumOfSquares(surveyValues, input.values);
      if (!doc.rssTop) {
        doc.rssTop = [];
      }
      minInsert(doc.rssTop, RSS_TOP_MAX_LENGTH, rss);
      const td = new TDigest();
      if (doc._rssData) {
        td.deserialize(doc._rssData);
      }
      td.push(rss);
      doc._rssData = td.serialize();
      doc.rssPercentiles = td.percentile(PERCENTILE_STEPS);
      return doc;
    });
  }
};
