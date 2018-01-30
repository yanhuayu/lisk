/*
 * Copyright © 2018 Lisk Foundation
 *
 * See the LICENSE file at the top-level directory of this distribution
 * for licensing information.
 *
 * Unless otherwise agreed in a custom licensing agreement with the Lisk Foundation,
 * no part of this software, including this file, may be copied, modified,
 * propagated, or distributed except according to the terms contained in the
 * LICENSE file.
 *
 * Removal or modification of this copyright notice is prohibited.
 */
/* Lisk Memory Tables
 *
 */

/*
  DESCRIPTION: ?

  PARAMETERS: ?
*/

SELECT a."blockId",
       b."id"
FROM mem_accounts a
LEFT OUTER JOIN blocks b ON b."id" = a."blockId"
WHERE a."blockId" IS NOT NULL
  AND a."blockId" != '0'
  AND b."id" IS NULL
