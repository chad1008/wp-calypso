/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { localize } from 'i18n-calypso';
import QueryJetpackScanHistory from 'calypso/components/data/query-jetpack-scan-history';

class JetpackBenefitsScanHistory extends React.Component {
	render() {
		const { siteId } = this.props;

		return <QueryJetpackScanHistory siteId={ siteId } />;
	}
}

export default connect( () => {
	return {};
}, {} )( localize( JetpackBenefitsScanHistory ) );
