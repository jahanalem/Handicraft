using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Umbraco.Core.Models;

namespace Jahan.Handicraft.Model.UModel
{
    public class Products : BaseEntity
    {
        public List<Product> ProductList { get; set; }
        public Products(IPublishedContent content, CultureInfo culture) : base(content, culture)
        {
            Initialize(content, culture);
        }

        public Products(IPublishedContent content) : base(content)
        {
            Initialize(content, null);
        }
        public override sealed void Initialize(IPublishedContent content, CultureInfo culture)
        {
            //ProductList.Skip((page - 1) * pageSize).Take(pageSize)
            ProductList = GetChildren<Product>(content);
        }
    }
}
