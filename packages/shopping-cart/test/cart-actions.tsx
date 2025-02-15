import {
	screen,
	render,
	waitFor,
	fireEvent,
	waitForElementToBeRemoved,
} from '@testing-library/react';
import React, { useEffect, useRef } from 'react';
import { getEmptyResponseCart } from '../src/empty-carts';
import { useShoppingCart, ShoppingCartProvider } from '../src/index';
import type {
	RequestCartProduct,
	ResponseCartProduct,
	RequestCart,
	ResponseCart,
	MinimalRequestCartProduct,
} from '../src/types';

// This is required to fix the "regeneratorRuntime is not defined" error
import '@automattic/calypso-polyfills';
import '@testing-library/jest-dom/extend-expect';

const planOne: ResponseCartProduct = {
	time_added_to_cart: Date.now(),
	current_quantity: 1,
	product_name: 'WordPress.com Personal',
	product_slug: 'personal-bundle',
	currency: 'BRL',
	extra: {
		context: 'signup',
	},
	meta: '',
	product_id: 1009,
	volume: 1,
	quantity: null,
	item_original_cost_integer: 14400,
	item_original_cost_display: 'R$144',
	item_subtotal_integer: 14400,
	item_subtotal_display: 'R$144',
	product_cost_integer: 14400,
	product_cost_display: 'R$144',
	item_subtotal_monthly_cost_display: 'R$144',
	item_subtotal_monthly_cost_integer: 14400,
	item_original_subtotal_integer: 14400,
	item_original_subtotal_display: 'R$144',
	is_domain_registration: false,
	is_bundled: false,
	is_sale_coupon_applied: false,
	months_per_bill_period: null,
	uuid: 'product001',
	cost: 144,
	price: 144,
	product_type: 'test',
	included_domain_purchase_amount: 0,
};

const planTwo: ResponseCartProduct = {
	time_added_to_cart: Date.now(),
	current_quantity: 1,
	product_name: 'WordPress.com Business',
	product_slug: 'business-bundle',
	currency: 'BRL',
	extra: {
		context: 'signup',
	},
	meta: '',
	product_id: 1010,
	volume: 1,
	quantity: null,
	item_original_cost_integer: 14400,
	item_original_cost_display: 'R$144',
	item_subtotal_integer: 14400,
	item_subtotal_display: 'R$144',
	product_cost_integer: 14400,
	product_cost_display: 'R$144',
	item_subtotal_monthly_cost_display: 'R$144',
	item_subtotal_monthly_cost_integer: 14400,
	item_original_subtotal_integer: 14400,
	item_original_subtotal_display: 'R$144',
	is_domain_registration: false,
	is_bundled: false,
	is_sale_coupon_applied: false,
	months_per_bill_period: null,
	uuid: 'product002',
	cost: 144,
	price: 144,
	product_type: 'test',
	included_domain_purchase_amount: 0,
};

const renewalOne: ResponseCartProduct = {
	...planOne,
	extra: { purchaseType: 'renewal' },
};

const renewalTwo: ResponseCartProduct = {
	...planTwo,
	extra: { purchaseType: 'renewal' },
};

const mainCartKey = '1';

const emptyResponseCart = getEmptyResponseCart();

async function getCart( cartKey: string ) {
	if ( cartKey === mainCartKey ) {
		return emptyResponseCart;
	}
	throw new Error( 'Unknown cart key' );
}

function createProduct( productProps: RequestCartProduct ): ResponseCartProduct {
	switch ( productProps.product_id ) {
		case 1009:
			return planOne;
		case 1010:
			return planTwo;
	}
	throw new Error( 'Unknown product' );
}

async function setCart( cartKey: string, newCart: RequestCart ): Promise< ResponseCart > {
	if ( cartKey === mainCartKey ) {
		// Mock the shopping-cart endpoint response here
		return {
			...emptyResponseCart,
			products: newCart.products.map( createProduct ),
			coupon: newCart.coupon,
			is_coupon_applied: !! newCart.coupon,
			tax: {
				display_taxes: !! newCart.tax?.location.postal_code,
				location: newCart.tax?.location,
			},
		};
	}
	throw new Error( 'Unknown cart key' );
}

function ProductList( {
	initialProducts,
	initialProductsForReplace,
	initialCoupon,
}: {
	initialProducts?: MinimalRequestCartProduct[];
	initialProductsForReplace?: MinimalRequestCartProduct[];
	initialCoupon?: string;
} ) {
	const { responseCart, addProductsToCart, replaceProductsInCart, applyCoupon } = useShoppingCart();
	const hasAddedProduct = useRef( false );
	useEffect( () => {
		if ( initialProducts && ! hasAddedProduct.current ) {
			hasAddedProduct.current = true;
			addProductsToCart( initialProducts );
		}
	}, [ addProductsToCart, initialProducts ] );
	useEffect( () => {
		if ( initialProductsForReplace && ! hasAddedProduct.current ) {
			hasAddedProduct.current = true;
			replaceProductsInCart( initialProductsForReplace );
		}
	}, [ replaceProductsInCart, initialProductsForReplace ] );
	const hasAddedCoupon = useRef( false );
	useEffect( () => {
		if ( initialCoupon && ! hasAddedCoupon.current ) {
			hasAddedCoupon.current = true;
			applyCoupon( initialCoupon );
		}
	}, [ applyCoupon, initialCoupon ] );
	if ( responseCart.products.length === 0 ) {
		return null;
	}
	const coupon = responseCart.is_coupon_applied ? <div>Coupon: { responseCart.coupon }</div> : null;
	const location = responseCart.tax.location.postal_code ? (
		<div>
			Location: { responseCart.tax.location.postal_code },{ ' ' }
			{ responseCart.tax.location.country_code }, { responseCart.tax.location.subdivision_code }
		</div>
	) : null;
	return (
		<ul data-testid="product-list">
			{ coupon }
			{ location }
			{ responseCart.products.map( ( product ) => {
				return (
					<li key={ product.uuid }>
						<span>{ product.product_slug }</span>
						<span>{ product.product_name }</span>
					</li>
				);
			} ) }
		</ul>
	);
}

function MockProvider( { children } ) {
	return (
		<ShoppingCartProvider cartKey={ mainCartKey } getCart={ getCart } setCart={ setCart }>
			{ children }
		</ShoppingCartProvider>
	);
}

describe( 'useShoppingCart', () => {
	const markUpdateComplete = jest.fn();

	beforeEach( () => {
		markUpdateComplete.mockClear();
	} );

	describe( 'addProductsToCart', () => {
		const TestComponent = ( { initialProducts = undefined, products = undefined } ) => {
			const { addProductsToCart } = useShoppingCart();
			const onClick = () => {
				products && addProductsToCart( products ).then( () => markUpdateComplete() );
			};
			return (
				<div>
					<ProductList initialProducts={ initialProducts } />
					<button onClick={ onClick }>Click me</button>
				</div>
			);
		};

		it( 'adds a product to the cart if the cart is empty', async () => {
			render(
				<MockProvider>
					<TestComponent products={ [ planOne ] } />
				</MockProvider>
			);
			fireEvent.click( screen.getByText( 'Click me' ) );
			await waitFor( () => screen.getByTestId( 'product-list' ) );
			expect( screen.getByTestId( 'product-list' ) ).toHaveTextContent( planOne.product_name );
		} );

		it( 'throws an error if the product is missing a product_id', async () => {
			expect( () => {
				render(
					<MockProvider>
						<TestComponent initialProducts={ [ { product_slug: planOne.product_slug } ] } />
					</MockProvider>
				);
			} ).toThrow( /product_id/ );
		} );

		it( 'adds a product to the cart if the existing products are not renewals and the new products are also', async () => {
			render(
				<MockProvider>
					<TestComponent initialProducts={ [ planTwo ] } products={ [ planOne ] } />
				</MockProvider>
			);
			fireEvent.click( screen.getByText( 'Click me' ) );
			await waitFor( () => screen.getByTestId( 'product-list' ) );
			expect( screen.getByTestId( 'product-list' ) ).toHaveTextContent( planOne.product_name );
			expect( screen.getByTestId( 'product-list' ) ).toHaveTextContent( planTwo.product_name );
		} );

		it( 'adds a product to the cart if the existing products are renewals and the new products are also', async () => {
			render(
				<MockProvider>
					<TestComponent initialProducts={ [ renewalTwo ] } products={ [ renewalOne ] } />
				</MockProvider>
			);
			fireEvent.click( screen.getByText( 'Click me' ) );
			await waitFor( () => screen.getByTestId( 'product-list' ) );
			expect( screen.getByTestId( 'product-list' ) ).toHaveTextContent( renewalTwo.product_name );
			expect( screen.getByTestId( 'product-list' ) ).toHaveTextContent( renewalOne.product_name );
		} );

		it( 'replaces the cart if the existing products are not renewals and any of the new products is a renewal', async () => {
			render(
				<MockProvider>
					<TestComponent initialProducts={ [ planOne ] } products={ [ renewalTwo ] } />
				</MockProvider>
			);
			fireEvent.click( screen.getByText( 'Click me' ) );
			await waitFor( () => screen.getByTestId( 'product-list' ) );
			expect( screen.getByTestId( 'product-list' ) ).not.toHaveTextContent( planOne.product_name );
			expect( screen.getByTestId( 'product-list' ) ).toHaveTextContent( renewalTwo.product_name );
		} );

		it( 'replaces the cart if any of the existing products is a renewal and the new products are not', async () => {
			render(
				<MockProvider>
					<TestComponent initialProducts={ [ renewalTwo ] } products={ [ planOne ] } />
				</MockProvider>
			);
			fireEvent.click( screen.getByText( 'Click me' ) );
			await waitFor( () => screen.getByTestId( 'product-list' ) );
			expect( screen.getByTestId( 'product-list' ) ).toHaveTextContent( planOne.product_name );
			expect( screen.getByTestId( 'product-list' ) ).not.toHaveTextContent(
				renewalTwo.product_name
			);
		} );

		it( 'returns a Promise that resolves after the update completes', async () => {
			render(
				<MockProvider>
					<TestComponent products={ [ planOne ] } />
				</MockProvider>
			);
			fireEvent.click( screen.getByText( 'Click me' ) );
			expect( markUpdateComplete ).not.toHaveBeenCalled();
			await waitFor( () => screen.getByTestId( 'product-list' ) );
			expect( markUpdateComplete ).toHaveBeenCalled();
		} );
	} );

	describe( 'removeProductFromCart', () => {
		const TestComponent = () => {
			const { removeProductFromCart, responseCart } = useShoppingCart();
			const onClick = () => {
				const uuid = responseCart.products.length ? responseCart.products[ 0 ].uuid : null;
				if ( uuid ) {
					removeProductFromCart( uuid ).then( () => markUpdateComplete() );
				}
			};
			return (
				<div>
					<ProductList initialProducts={ [ planOne ] } />
					<button onClick={ onClick }>Click me</button>
				</div>
			);
		};

		it( 'removes a product from the cart', async () => {
			render(
				<MockProvider>
					<TestComponent />
				</MockProvider>
			);
			await waitFor( () => screen.getByTestId( 'product-list' ) );
			expect( screen.getByText( planOne.product_name ) ).toBeInTheDocument();
			fireEvent.click( screen.getByText( 'Click me' ) );
			await waitForElementToBeRemoved( () => screen.queryByText( planOne.product_name ) );
		} );

		it( 'returns a Promise that resolves after the update completes', async () => {
			render(
				<MockProvider>
					<TestComponent />
				</MockProvider>
			);

			await waitFor( () => screen.getByTestId( 'product-list' ) );
			expect( screen.getByText( planOne.product_name ) ).toBeInTheDocument();
			fireEvent.click( screen.getByText( 'Click me' ) );
			expect( markUpdateComplete ).not.toHaveBeenCalled();
			await waitFor( () => {
				expect( markUpdateComplete ).toHaveBeenCalled();
			} );
		} );
	} );

	describe( 'replaceProductsInCart', () => {
		const TestComponent = ( { initialProductsForReplace = undefined } ) => {
			const { replaceProductsInCart } = useShoppingCart();
			const onClick = () => {
				replaceProductsInCart( [ planTwo ] ).then( () => markUpdateComplete() );
			};
			return (
				<div>
					<ProductList
						initialProducts={ initialProductsForReplace ? undefined : [ planOne ] }
						initialProductsForReplace={ initialProductsForReplace }
					/>
					<button onClick={ onClick }>Click me</button>
				</div>
			);
		};

		it( 'replaces all products in the cart', async () => {
			render(
				<MockProvider>
					<TestComponent />
				</MockProvider>
			);
			await waitFor( () => screen.getByTestId( 'product-list' ) );
			expect( screen.getByText( planOne.product_name ) ).toBeInTheDocument();
			fireEvent.click( screen.getByText( 'Click me' ) );
			await waitForElementToBeRemoved( () => screen.queryByText( planOne.product_name ) );
			expect( screen.getByText( planTwo.product_name ) ).toBeInTheDocument();
		} );

		it( 'throws an error if a product is missing a product_id', async () => {
			expect( () => {
				render(
					<MockProvider>
						<TestComponent
							initialProductsForReplace={ [ { product_slug: planOne.product_slug } ] }
						/>
					</MockProvider>
				);
			} ).toThrow( /product_id/ );
		} );

		it( 'returns a Promise that resolves after the update completes', async () => {
			render(
				<MockProvider>
					<TestComponent />
				</MockProvider>
			);

			await waitFor( () => screen.getByTestId( 'product-list' ) );
			fireEvent.click( screen.getByText( 'Click me' ) );
			expect( markUpdateComplete ).not.toHaveBeenCalled();
			await waitFor( () => {
				expect( markUpdateComplete ).toHaveBeenCalled();
			} );
		} );
	} );

	describe( 'replaceProductInCart', () => {
		const TestComponent = () => {
			const { replaceProductInCart, responseCart } = useShoppingCart();
			const onClick = () => {
				const uuid = responseCart.products.length ? responseCart.products[ 0 ].uuid : null;
				if ( uuid ) {
					replaceProductInCart( uuid, { product_id: planTwo.product_id } ).then( () =>
						markUpdateComplete()
					);
				}
			};
			return (
				<div>
					<ProductList initialProducts={ [ planOne ] } />
					<button onClick={ onClick }>Click me</button>
				</div>
			);
		};

		it( 'updates a product in the cart', async () => {
			render(
				<MockProvider>
					<TestComponent />
				</MockProvider>
			);
			await waitFor( () => screen.getByTestId( 'product-list' ) );
			expect( screen.getByText( planOne.product_slug ) ).toBeInTheDocument();
			fireEvent.click( screen.getByText( 'Click me' ) );
			await waitForElementToBeRemoved( () => screen.queryByText( planOne.product_slug ) );
			expect( screen.getByText( planTwo.product_slug ) ).toBeInTheDocument();
		} );

		it( 'returns a Promise that resolves after the update completes', async () => {
			render(
				<MockProvider>
					<TestComponent />
				</MockProvider>
			);

			await waitFor( () => screen.getByTestId( 'product-list' ) );
			fireEvent.click( screen.getByText( 'Click me' ) );
			expect( markUpdateComplete ).not.toHaveBeenCalled();
			await waitFor( () => {
				expect( markUpdateComplete ).toHaveBeenCalled();
			} );
		} );
	} );

	describe( 'applyCoupon', () => {
		const TestComponent = () => {
			const { applyCoupon } = useShoppingCart();
			const onClick = () => {
				applyCoupon( 'ABCD' ).then( () => markUpdateComplete() );
			};
			return (
				<div>
					<ProductList initialProducts={ [ planOne ] } />
					<button onClick={ onClick }>Click me</button>
				</div>
			);
		};

		it( 'adds a coupon to the cart', async () => {
			render(
				<MockProvider>
					<TestComponent />
				</MockProvider>
			);
			await waitFor( () => screen.getByTestId( 'product-list' ) );
			expect( screen.queryByText( 'Coupon: ABCD' ) ).not.toBeInTheDocument();
			fireEvent.click( screen.getByText( 'Click me' ) );
			await waitFor( () => {
				expect( screen.getByText( 'Coupon: ABCD' ) ).toBeInTheDocument();
			} );
		} );

		it( 'returns a Promise that resolves after the update completes', async () => {
			render(
				<MockProvider>
					<TestComponent />
				</MockProvider>
			);

			await waitFor( () => screen.getByTestId( 'product-list' ) );
			fireEvent.click( screen.getByText( 'Click me' ) );
			expect( markUpdateComplete ).not.toHaveBeenCalled();
			await waitFor( () => {
				expect( markUpdateComplete ).toHaveBeenCalled();
			} );
		} );
	} );

	describe( 'removeCoupon', () => {
		const TestComponent = () => {
			const { removeCoupon } = useShoppingCart();
			const onClick = () => {
				removeCoupon().then( () => markUpdateComplete() );
			};
			return (
				<div>
					<ProductList initialProducts={ [ planOne ] } initialCoupon="ABCD" />
					<button onClick={ onClick }>Click me</button>
				</div>
			);
		};

		it( 'removes a coupon from the cart', async () => {
			render(
				<MockProvider>
					<TestComponent />
				</MockProvider>
			);
			await waitFor( () => screen.getByTestId( 'product-list' ) );
			expect( screen.getByText( 'Coupon: ABCD' ) ).toBeInTheDocument();
			fireEvent.click( screen.getByText( 'Click me' ) );
			await waitForElementToBeRemoved( () => screen.queryByText( 'Coupon: ABCD' ) );
		} );

		it( 'returns a Promise that resolves after the update completes', async () => {
			render(
				<MockProvider>
					<TestComponent />
				</MockProvider>
			);

			await waitFor( () => screen.getByTestId( 'product-list' ) );
			fireEvent.click( screen.getByText( 'Click me' ) );
			expect( markUpdateComplete ).not.toHaveBeenCalled();
			await waitFor( () => {
				expect( markUpdateComplete ).toHaveBeenCalled();
			} );
		} );
	} );

	describe( 'updateLocation', () => {
		const TestComponent = () => {
			const { updateLocation } = useShoppingCart();
			const onClick = () => {
				updateLocation( {
					countryCode: 'US',
					postalCode: '10001',
					subdivisionCode: 'NY',
				} ).then( () => markUpdateComplete() );
			};
			return (
				<div>
					<ProductList initialProducts={ [ planOne ] } initialCoupon="ABCD" />
					<button onClick={ onClick }>Click me</button>
				</div>
			);
		};

		it( 'adds a location to the cart', async () => {
			render(
				<MockProvider>
					<TestComponent />
				</MockProvider>
			);
			const locationText = 'Location: 10001, US, NY';
			await waitFor( () => screen.getByTestId( 'product-list' ) );
			expect( screen.queryByText( locationText ) ).not.toBeInTheDocument();
			fireEvent.click( screen.getByText( 'Click me' ) );
			await waitFor( async () => {
				expect( screen.getByText( locationText ) ).toBeInTheDocument();
			} );
		} );

		it( 'returns a Promise that resolves after the update completes', async () => {
			render(
				<MockProvider>
					<TestComponent />
				</MockProvider>
			);

			await waitFor( () => screen.getByTestId( 'product-list' ) );
			fireEvent.click( screen.getByText( 'Click me' ) );
			expect( markUpdateComplete ).not.toHaveBeenCalled();
			await waitFor( () => {
				expect( markUpdateComplete ).toHaveBeenCalled();
			} );
		} );
	} );

	describe( 'reloadFromServer', () => {
		const TestComponent = () => {
			const { reloadFromServer } = useShoppingCart();
			const onClick = () => {
				reloadFromServer().then( () => markUpdateComplete() );
			};
			return (
				<div>
					<ProductList initialProducts={ [ planOne ] } />
					<button onClick={ onClick }>Click me</button>
				</div>
			);
		};

		it( 'reloads the cart from the server', async () => {
			render(
				<MockProvider>
					<TestComponent />
				</MockProvider>
			);
			await waitFor( () => screen.getByTestId( 'product-list' ) );
			expect( screen.getByText( planOne.product_name ) ).toBeInTheDocument();
			fireEvent.click( screen.getByText( 'Click me' ) );
			await waitFor( () => {
				expect( screen.queryByText( planOne.product_name ) ).not.toBeInTheDocument();
			} );
		} );

		it( 'returns a Promise that resolves after the update completes', async () => {
			render(
				<MockProvider>
					<TestComponent />
				</MockProvider>
			);

			await waitFor( () => screen.getByTestId( 'product-list' ) );
			fireEvent.click( screen.getByText( 'Click me' ) );
			expect( markUpdateComplete ).not.toHaveBeenCalled();
			await waitFor( () => {
				expect( markUpdateComplete ).toHaveBeenCalled();
			} );
		} );
	} );
} );
