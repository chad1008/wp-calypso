/**
 * External Dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import moment from 'moment';

/**
 * Internal Dependencies
 */
import { localize } from 'i18n-calypso';
import { getPlanClass } from '@automattic/calypso-products';
import { getSiteSlug, getSiteTitle, getSitePlanSlug } from 'calypso/state/sites/selectors';
import getRewindState from 'calypso/state/selectors/get-rewind-state';
import getSiteScanState from 'calypso/state/selectors/get-site-scan-state';
import JetpackBenefitsSiteVisits from 'calypso/blocks/jetpack-benefits/site-visits';
import memoizeLast from 'calypso/lib/memoize-last';
import JetpackBenefitsScanHistory from 'calypso/blocks/jetpack-benefits/scan-history';

const memoizedQuery = memoizeLast( ( period, unit, quantity, endOf ) => ( {
	period,
	unit: unit,
	quantity: quantity,
	date: endOf,
} ) );

class JetpackBenefits extends React.Component {
	hasBackups() {
		// TODO: check that the plan being cancelled includes backup (or is a standalone backup product)
		return 'unavailable' !== this.props.rewindState?.state;
	}

	hasScan() {
		// TODO: check that the plan being cancelled includes scan (or is a standalone scan product)
		return 'unavailable' !== this.props.scanState?.state;
	}

	/**
	 * Show number of site visits in the last year
	 * @returns {JSX.Element}
	 */
	renderSiteVisits() {
		const today = moment().locale( 'en' );
		const period = 'year';
		const query = memoizedQuery( period, 'month', 12, today.format( 'YYYY-MM-DD' ) );

		return (
			<JetpackBenefitsSiteVisits
				siteId={ this.props.siteId }
				query={ query }
				statType="statsVisits"
			/>
		);
	}

	/**
	 * Show the number of backups/ amount of time this site has been backed up for
	 */
	renderSiteBackups() {
		// there is not a great way to get the full count of backups from wpcom at the moment
		// can get the 10 most recent from the /rewind/backups endpoint
		// could show last successful/ next scheduled?
	}

	renderSiteScanResults() {
		return <JetpackBenefitsScanHistory siteId={ this.props.siteId } />;
	}

	/**
	 * Show benefits that do not depend on site data
	 * These can vary by plan, but we do not need to get any data about the site to show these
	 */
	renderGeneralBenefits() {
		// check the disconnection flow - some general Jetpack benefits are shown there now
	}

	render() {
		// determine what features a plan/ product has and show relevant messages
		return (
			<React.Fragment>
				{ this.renderSiteVisits() }
				{ this.hasBackups() && this.renderSiteBackups() }
				{ /* site search - may not be a way to show # of searches served */ }
				{ /* spam filtering stats - Undocumented.prototype may be the place to start here */ }
				{ this.hasScan() && this.renderSiteScanResults() }
				{ /* activity log stats - start with requestActivityLogs to get this information */ }
			</React.Fragment>
		);
	}
}

export default connect( ( state, { siteId } ) => {
	const planSlug = getSitePlanSlug( state, siteId );
	const planClass = planSlug ? getPlanClass( planSlug ) : 'is-free-plan';

	return {
		siteId: siteId,
		plan: planClass,
		rewindState: getRewindState( state, siteId ),
		scanState: getSiteScanState( state, siteId ),
		siteSlug: getSiteSlug( state, siteId ),
		siteTitle: getSiteTitle( state, siteId ),
	};
}, {} )( localize( JetpackBenefits ) );
