/**
 * External Dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import QuerySiteStats from 'calypso/components/data/query-site-stats';
import {
	getSiteStatsNormalizedData,
	isRequestingSiteStatsForQuery,
} from 'calypso/state/stats/lists/selectors';

/**
 * Internal Dependencies
 */

/**
 * Show some basic site stats to illustrate the benefits of Jetpack
 */
class JetpackBenefitsSiteVisits extends React.Component {
	showTotalSiteVisits() {
		if ( this.props.requesting ) {
			return '...';
		}

		let countVisits = 0;
		this.props.data.map( ( monthPeriod ) => {
			countVisits += monthPeriod.views;
		} );

		return countVisits + ' site visitors tracked in the last year';
	}

	render() {
		const { statType, siteId, query } = this.props;

		// load select stats for this site (primarily visitor count)
		// query the site stats here
		// shows within the context of a "benefits" card
		return (
			<React.Fragment>
				{ statType && siteId && (
					<QuerySiteStats siteId={ siteId } statType={ statType } query={ query } />
				) }

				<div className="card collapse">
					<b>Site Stats</b>
					<p>{ this.showTotalSiteVisits() }</p>
				</div>
			</React.Fragment>
		);
	}
}

export default connect( ( state, { siteId, statType, query } ) => {
	return {
		requesting: isRequestingSiteStatsForQuery( state, siteId, statType, query ),
		data: getSiteStatsNormalizedData( state, siteId, statType, query ),
	};
}, {} )( JetpackBenefitsSiteVisits );
