/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import moment from 'moment';

/**
 * Internal dependencies
 */
import { localize } from 'i18n-calypso';
import QueryJetpackScanThreatCounts from 'calypso/components/data/query-jetpack-scan-threat-counts';
import isRequestingJetpackScan from 'calypso/state/selectors/is-requesting-jetpack-scan';
import isRequestingJetpackScanThreatCounts from 'calypso/state/selectors/is-requesting-jetpack-scan-threat-counts';

class JetpackBenefitsScanHistory extends React.Component {
	renderThreatsFixed() {
		const { scanThreats } = this.props;

		// only show this if there have been fixed threats
		if ( scanThreats.fixed > 0 ) {
			return <span>Jetpack Scan has fixed { scanThreats.fixed } on your site</span>;
		}

		return null;
	}

	renderLastScan() {
		const { scanThreats, lastScan } = this.props;

		// only show this if there have been been no fixed threats
		if ( scanThreats.fixed <= 0 ) {
			// TODO: its possible the scan is still running - handle this appropriately
			return <span>The last scan ran { moment( lastScan.timestamp ).fromNow() }</span>;
		}

		return null;
	}

	renderScanData() {
		const { requestingThreats, requestingScan, scanThreats, lastScan, isStandalone } = this.props;

		if ( requestingThreats === true || requestingScan === true ) {
			return <span>...</span>;
		}

		if ( scanThreats && lastScan ) {
			// Handle Standalone scan products a bit differently
			if ( isStandalone ) {
				return this.renderLastScan();
			}

			return (
				<React.Fragment>
					{ this.renderThreatsFixed() }
					{ this.renderLastScan() }
				</React.Fragment>
			);
		}

		return null;
	}

	render() {
		const { siteId } = this.props;

		return (
			<div className="jetpack-benefits__card card">
				<QueryJetpackScanThreatCounts siteId={ siteId } />
				{ this.renderScanData() }
			</div>
		);
	}
}

export default connect( ( state, { siteId } ) => {
	// maybe these need their own selector methods in /client/state/jetpack-scan
	return {
		requestingThreats: isRequestingJetpackScanThreatCounts( state, siteId ),
		requestingScan: isRequestingJetpackScan( state, siteId ),
		scanThreats: state.jetpackScan.threatCounts?.data?.[ siteId ],
		lastScan: state.jetpackScan.scan?.[ siteId ]?.mostRecent,
	};
}, {} )( localize( JetpackBenefitsScanHistory ) );
