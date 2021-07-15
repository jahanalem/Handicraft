using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using umbraco.NodeFactory;
using Umbraco.Core.Models;

namespace Jahan.Handicraft.Model.UModel
{
    public class HomePage : BaseEntity
    {
        public List<Photo> PhotoList { get; set; }
        public List<HighlightProducts> HighlightProd { get; set; }
        public List<Banner> Banners { get; set; }

        public HomePage(IPublishedContent content, CultureInfo culture) : base(content, culture)
        {
            Initialize(content, culture);
        }
        public HomePage(IPublishedContent content) : base(content)
        {
            Initialize(content, null);
        }
        protected HomePage()
        {
        }
        public override sealed void Initialize(IPublishedContent content, CultureInfo culture)
        {
            if (content != null)
            {
                PhotoList = GetChildrenOfTargetNode<Photo>(content, "PhotoCollection", culture);
                HighlightProd = HighlightProducts.Get(content, "Highlight", culture);
                Banners = BannerCollection.Get(content, "BannerCollection", culture);
            }
        }
    }
}
